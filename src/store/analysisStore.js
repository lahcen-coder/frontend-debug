import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

/**
 * Analysis Store — handles the full lifecycle of a "Debug Together" analysis:
 *   submit → poll → report → history
 *
 * Report shape (from GeminiAnalyzerService via the API):
 * {
 *   chemistry_score,       common_interests,
 *   communication_style,   misunderstanding_resolver,
 *   memory_box,            activity_suggestions,
 *   safety_flag,           generated_at
 * }
 */
export const useAnalysisStore = create(
  persist(
    (set, get) => ({
      // ── Data ────────────────────────────────────────────────────────────────
      analyses:          [],
      currentAnalysis:   null,   // { id, platform, status, ... }
      currentAnalysisMeta: null, // metadata from the /report endpoint
      currentReport:     null,   // structured AI report object

      // ── Loading flags ────────────────────────────────────────────────────────
      isSubmitting:      false,
      isPolling:         false,
      isLoadingReport:   false,
      isLoadingHistory:  false,

      // ── Error ────────────────────────────────────────────────────────────────
      error: null,

      // ══════════════════════════════════════════════════════════════════════
      // Actions
      // ══════════════════════════════════════════════════════════════════════

      /**
       * POST /api/v1/analyses
       * Submits the clean message payload. Returns the pending Analysis record.
       *
       * @param {{ platform, partner_name, messages: Message[] }} payload
       */
      submitAnalysis: async (payload) => {
        set({ isSubmitting: true, error: null })
        try {
          const res = await api.post('/analyses', payload)
          const analysis = res.data.data
          set({ currentAnalysis: analysis, isSubmitting: false })
          return analysis
        } catch (err) {
          const msg =
            err.response?.data?.error?.message ||
            'Failed to submit the analysis. Please try again.'
          set({ error: msg, isSubmitting: false })
          throw err
        }
      },

      /**
       * Poll GET /api/v1/analyses/:id every 3 s until status reaches a terminal state.
       *
       * @param {string|number} id
       * @param {object} [opts]
       * @param {(analysis: object) => void} [opts.onProgress]  Called on every tick.
       * @param {number} [opts.maxWait=300_000]  Hard timeout in ms (default 5 min).
       * @returns {Promise<object>} The final analysis object.
       */
      pollStatus: (id, { onProgress, maxWait = 300_000 } = {}) => {
        set({ isPolling: true })
        const startedAt = Date.now()

        return new Promise((resolve, reject) => {
          let interval = null

          const stop = (fn, arg) => {
            clearInterval(interval)
            set({ isPolling: false })
            fn(arg)
          }

          const tick = async () => {
            if (Date.now() - startedAt > maxWait) {
              stop(reject, new Error('Analysis is taking too long. Please check back later.'))
              return
            }

            try {
              const res = await api.get(`/analyses/${id}`)
              const analysis = res.data.data
              set({ currentAnalysis: analysis })
              onProgress?.(analysis)

              if (analysis.status === 'completed' || analysis.status === 'failed') {
                stop(resolve, analysis)
              }
            } catch (err) {
              stop(reject, err)
            }
          }

          tick()
          interval = setInterval(tick, 3_000)
        })
      },

      /**
       * GET /api/v1/analyses/:id/report
       * Fetches the full structured report and stores it in currentReport.
       */
      fetchReport: async (id) => {
        set({ isLoadingReport: true, error: null })
        try {
          const res = await api.get(`/analyses/${id}/report`)
          // Backend returns { data: { analysis, report, generated_at } }
          const raw = res.data.data
          const report = raw?.report ?? raw        // normalise both shapes
          const meta   = raw?.analysis   ?? null
          set({ currentReport: report, currentAnalysisMeta: meta, isLoadingReport: false })
          return report
        } catch (err) {
          const msg =
            err.response?.status === 409
              ? 'Report is still being generated. Hang tight!'
              : err.response?.data?.error?.message || 'Could not load the report.'
          set({ error: msg, isLoadingReport: false })
          throw err
        }
      },

      /**
       * GET /api/v1/analyses
       * Fetches the paginated analysis history for the current user.
       */
      fetchHistory: async (params = {}) => {
        set({ isLoadingHistory: true })
        try {
          const res = await api.get('/analyses', { params })
          set({ analyses: res.data.data ?? [], isLoadingHistory: false })
          return res.data
        } catch {
          set({ isLoadingHistory: false })
        }
      },

      /** Alias for fetchHistory (used by older code). */
      fetchAnalyses: async (params) => get().fetchHistory(params),

      /** DELETE /api/v1/analyses/:id */
      deleteAnalysis: async (id) => {
        await api.delete(`/analyses/${id}`)
        set((s) => ({ analyses: s.analyses.filter((a) => a.id !== String(id) && a.id !== id) }))
        if (String(get().currentAnalysis?.id) === String(id)) {
          set({ currentAnalysis: null, currentReport: null, currentAnalysisMeta: null })
        }
      },

      /** Clear transient state between flows. */
      clearCurrent: () =>
        set({ currentAnalysis: null, currentReport: null, currentAnalysisMeta: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'dt-analysis-store',
      // Only persist the list — never persist reports (privacy + stale data)
      partialize: (s) => ({ analyses: s.analyses }),
    }
  )
)
