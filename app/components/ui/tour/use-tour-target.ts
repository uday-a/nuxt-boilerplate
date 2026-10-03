import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

export type TourTarget = string | (() => HTMLElement | null) | HTMLElement | null

export interface TargetRect {
  x: number
  y: number
  width: number
  height: number
}

export function useTourTarget(target: Ref<TourTarget | undefined>) {
  const rect = ref<TargetRect | null>(null)
  const element = ref<HTMLElement | null>(null)

  let resizeObs: ResizeObserver | null = null
  let raf = 0

  function resolve(): HTMLElement | null {
    const t = target.value
    if (!t) return null
    if (typeof t === 'string') return document.querySelector(t) as HTMLElement | null
    if (typeof t === 'function') return t()
    return t
  }

  function measure() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      if (!element.value) {
        rect.value = null
        return
      }
      const r = element.value.getBoundingClientRect()
      rect.value = { x: r.left, y: r.top, width: r.width, height: r.height }
    })
  }

  function attach() {
    detach()
    element.value = resolve()
    if (!element.value) {
      rect.value = null
      return
    }
    // Off-screen target (e.g. a link at the bottom of the page): bring it
    // into view first; the scroll listener below re-measures as it moves.
    const r = element.value.getBoundingClientRect()
    if (r.bottom < 0 || r.top > window.innerHeight) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      element.value.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    }
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(measure)
      resizeObs.observe(element.value)
      resizeObs.observe(document.documentElement)
    }
    window.addEventListener('scroll', measure, { passive: true, capture: true })
    window.addEventListener('resize', measure, { passive: true })
  }

  function detach() {
    resizeObs?.disconnect()
    resizeObs = null
    window.removeEventListener('scroll', measure, true)
    window.removeEventListener('resize', measure)
    cancelAnimationFrame(raf)
  }

  watch(target, attach, { immediate: false })

  onBeforeUnmount(detach)

  return { element, rect, attach, detach, measure }
}
