import {
    startTransition,
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
} from "react"
import { addPropertyControls, ControlType } from "framer"

const BASE_URL = "https://syncsphere-hiv6.onrender.com"
const COURSES_URL = `${BASE_URL}/assignment/course-data`
const COUNTRY_URL = `${BASE_URL}/assignment/country-code`

type Country = "IN" | "US" | null
type ViewState = "loading" | "error" | "empty" | "success"
type SortMode = "featured" | "price-asc" | "price-desc"

interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

interface CountryResponse {
    country_code?: string
}

interface SkillpathCoursesProps {
    sectionTitle: string
    accentColor: string
    style?: CSSProperties
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
    })

    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return (await response.json()) as T
}

function formatInr(paise: number): string {
    const amount = paise / 100
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

function formatUsd(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cents / 100)
}

function formatPrice(course: Course, country: Country): string {
    if (country === "IN") return formatInr(course.pricePaise)
    if (country === "US") return formatUsd(course.priceUsdCents)
    return `${formatInr(course.pricePaise)} / ${formatUsd(course.priceUsdCents)}`
}

function SkeletonCard({ index }: { index: number }) {
    return (
        <div className="sp-card sp-skeleton-card" aria-hidden="true">
            <div className="sp-card-top">
                <span className="sp-index">0{index + 1}</span>
                <div className="sp-skeleton sp-skeleton-pill" />
            </div>
            <div className="sp-skeleton sp-skeleton-title" />
            <div className="sp-skeleton sp-skeleton-line" />
            <div className="sp-skeleton sp-skeleton-line sp-skeleton-short" />
            <div className="sp-card-spacer" />
            <div className="sp-skeleton sp-skeleton-price" />
        </div>
    )
}

/**
 * Skillpath live course catalogue.
 *
 * @framerIntrinsicWidth 1100
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SkillpathCourses(props: SkillpathCoursesProps) {
    const {
        sectionTitle = "Courses for useful, real-world work.",
        accentColor = "#FF3C00",
        style,
    } = props

    const [courses, setCourses] = useState<Course[]>([])
    const [country, setCountry] = useState<Country>(null)
    const [countryUnavailable, setCountryUnavailable] = useState(false)
    const [viewState, setViewState] = useState<ViewState>("loading")
    const [retryCount, setRetryCount] = useState(0)
    const [query, setQuery] = useState("")
    const [sortMode, setSortMode] = useState<SortMode>("featured")

    useEffect(() => {
        if (typeof window === "undefined") return

        const controller = new AbortController()
        let active = true

        startTransition(() => {
            setViewState("loading")
            setCountryUnavailable(false)
        })

        async function load() {
            const [courseResult, countryResult] = await Promise.allSettled([
                getJson<Course[]>(COURSES_URL, controller.signal),
                getJson<CountryResponse>(COUNTRY_URL, controller.signal),
            ])

            if (!active) return

            if (
                courseResult.status === "rejected" ||
                !Array.isArray(courseResult.value)
            ) {
                startTransition(() => {
                    setCourses([])
                    setCountry(null)
                    setViewState("error")
                })
                return
            }

            let resolvedCountry: Country = null
            let locationFailed = true

            if (countryResult.status === "fulfilled") {
                const code = countryResult.value.country_code
                if (code === "IN" || code === "US") {
                    resolvedCountry = code
                    locationFailed = false
                }
            }

            startTransition(() => {
                setCourses(courseResult.value)
                setCountry(resolvedCountry)
                setCountryUnavailable(locationFailed)
                setViewState(courseResult.value.length === 0 ? "empty" : "success")
            })
        }

        void load()
        return () => {
            active = false
            controller.abort()
        }
    }, [retryCount])

    const visibleCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        const filtered = normalizedQuery
            ? courses.filter((course) =>
                  [course.courseName, course.description, course.mainCategory]
                      .join(" ")
                      .toLowerCase()
                      .includes(normalizedQuery)
              )
            : [...courses]

        if (sortMode === "featured") return filtered

        const priceKey: "pricePaise" | "priceUsdCents" =
            country === "US" ? "priceUsdCents" : "pricePaise"
        const direction = sortMode === "price-asc" ? 1 : -1
        return filtered.sort(
            (a, b) => (a[priceKey] - b[priceKey]) * direction
        )
    }, [courses, country, query, sortMode])

    const rootStyle = {
        ...style,
        position: "relative",
        width: "100%",
        height: "auto",
        color: "#090909",
        fontFamily: '"Inter Display", Inter, Arial, sans-serif',
        containerType: "inline-size",
        containerName: "skillpath-courses",
        ["--sp-accent" as string]: accentColor,
    } as CSSProperties

    return (
        <section style={rootStyle} aria-labelledby="skillpath-courses-title">
            <style>{`
                .sp-shell { width: 100%; display: flex; flex-direction: column; gap: 32px; }
                .sp-heading-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; border-top: 1px solid #0A0A0A; padding-top: 22px; }
                .sp-heading-copy { max-width: 820px; }
                .sp-eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 18px; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
                .sp-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sp-accent); flex: 0 0 auto; }
                .sp-title { margin: 0; font-size: clamp(48px, 6.7cqw, 86px); line-height: .93; letter-spacing: -.055em; font-weight: 500; text-wrap: balance; }
                .sp-count { margin: 0 0 8px; font-size: 13px; font-weight: 600; white-space: nowrap; }
                .sp-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; }
                .sp-search, .sp-sort { min-height: 54px; border: 1.5px solid #0A0A0A; border-radius: 999px; background: #FFFFFF; color: #0A0A0A; font: inherit; font-size: 14px; font-weight: 600; outline: none; }
                .sp-search { padding: 0 22px; }
                .sp-sort { padding: 0 42px 0 20px; cursor: pointer; }
                .sp-search:focus, .sp-sort:focus { box-shadow: 0 0 0 4px color-mix(in srgb, var(--sp-accent) 20%, transparent); border-color: var(--sp-accent); }
                .sp-notice { margin: -12px 0 0; border-left: 4px solid var(--sp-accent); padding: 10px 14px; background: #F2F2EF; font-size: 13px; line-height: 1.45; }
                .sp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; width: 100%; }
                .sp-card { min-width: 0; min-height: 350px; padding: 20px; border: 1.5px solid #0A0A0A; border-radius: 14px; background: #F4F4F1; display: flex; flex-direction: column; gap: 18px; overflow: hidden; transition: transform .25s ease, background-color .25s ease; }
                .sp-card:hover { transform: translateY(-4px); }
                .sp-card:nth-child(4n + 1) { background: #0A0A0A; color: #FFFFFF; }
                .sp-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
                .sp-index { color: var(--sp-accent); font-size: 12px; line-height: 1; font-weight: 800; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
                .sp-badges { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 6px; min-height: 25px; }
                .sp-badge { display: inline-flex; align-items: center; width: fit-content; padding: 6px 9px; border: 1px solid currentColor; border-radius: 999px; font-size: 10px; line-height: 1; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
                .sp-refund { border-color: var(--sp-accent); color: var(--sp-accent); }
                .sp-card-title { margin: 10px 0 0; font-size: clamp(25px, 2.6cqw, 34px); line-height: .98; letter-spacing: -.045em; font-weight: 600; text-wrap: balance; }
                .sp-description { margin: 0; color: #5F5F5F; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; min-height: 3em; }
                .sp-card:nth-child(4n + 1) .sp-description { color: #BDBDB8; }
                .sp-card-spacer { flex: 1 1 auto; }
                .sp-price-wrap { border-top: 1px solid currentColor; padding-top: 16px; }
                .sp-price-label { margin: 0 0 7px; opacity: .62; font-size: 10px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
                .sp-price { margin: 0; font-size: 28px; line-height: 1; letter-spacing: -.035em; font-weight: 650; font-variant-numeric: tabular-nums; }
                .sp-state { min-height: 310px; border: 2px solid #0A0A0A; border-radius: 14px; background: #F4F4F1; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: 14px; padding: 28px; }
                .sp-state::before { content: ""; width: 34px; height: 34px; border: 3px solid var(--sp-accent); border-radius: 50%; margin-bottom: auto; }
                .sp-state h3 { margin: 0; max-width: 620px; font-size: clamp(34px, 5cqw, 62px); line-height: .95; letter-spacing: -.05em; font-weight: 550; }
                .sp-state p { margin: 0; max-width: 520px; color: #5D5D5D; font-size: 14px; line-height: 1.5; }
                .sp-button { border: 0; border-radius: 999px; padding: 14px 20px; background: #0A0A0A; color: #FFFFFF; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
                .sp-skeleton { border-radius: 999px; background: linear-gradient(90deg, #D8D8D3 20%, #F7F7F4 45%, #D8D8D3 70%); background-size: 250% 100%; animation: sp-shimmer 1.25s linear infinite; }
                .sp-card:nth-child(4n + 1) .sp-skeleton { background: linear-gradient(90deg, #242424 20%, #3A3A3A 45%, #242424 70%); background-size: 250% 100%; }
                .sp-skeleton-pill { width: 86px; height: 25px; }
                .sp-skeleton-title { width: 80%; height: 31px; margin-top: 8px; }
                .sp-skeleton-line { width: 100%; height: 12px; }
                .sp-skeleton-short { width: 62%; }
                .sp-skeleton-price { width: 42%; height: 27px; }
                @keyframes sp-shimmer { to { background-position: -250% 0; } }
                @media (prefers-reduced-motion: reduce) { .sp-skeleton { animation: none; } .sp-card { transition: none; } }
                @container skillpath-courses (max-width: 760px) {
                    .sp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .sp-title { font-size: clamp(46px, 8.3cqw, 68px); }
                }
                @container skillpath-courses (max-width: 560px) {
                    .sp-shell { gap: 24px; }
                    .sp-heading-row { align-items: flex-start; flex-direction: column; gap: 10px; }
                    .sp-count { margin: 0; }
                    .sp-toolbar { grid-template-columns: 1fr; }
                    .sp-search, .sp-sort { width: 100%; }
                    .sp-grid { grid-template-columns: 1fr; }
                    .sp-card { min-height: 320px; }
                    .sp-title { font-size: clamp(42px, 13.5cqw, 56px); }
                    .sp-card-title { font-size: 30px; }
                }
            `}</style>

            <div className="sp-shell">
                <div className="sp-heading-row">
                    <div className="sp-heading-copy">
                        <p className="sp-eyebrow"><span className="sp-dot" />Live course catalogue</p>
                        <h2 id="skillpath-courses-title" className="sp-title">{sectionTitle}</h2>
                    </div>
                    {viewState === "success" && <p className="sp-count">{courses.length} courses available</p>}
                </div>

                {(viewState === "success" || viewState === "empty") && (
                    <div className="sp-toolbar">
                        <input className="sp-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" aria-label="Search courses" />
                        <select className="sp-sort" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Sort courses">
                            <option value="featured">Featured order</option>
                            <option value="price-asc">Price: low to high</option>
                            <option value="price-desc">Price: high to low</option>
                        </select>
                    </div>
                )}

                {countryUnavailable && viewState === "success" && (
                    <p className="sp-notice" role="status">We couldn’t confirm your region, so each course shows both INR and USD.</p>
                )}

                {viewState === "loading" && (
                    <div className="sp-grid" aria-label="Loading courses" aria-busy="true">
                        {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} index={index} />)}
                    </div>
                )}

                {viewState === "error" && (
                    <div className="sp-state" role="alert">
                        <h3>Courses didn’t load this time.</h3>
                        <p>The catalogue can be temporarily unavailable. Nothing is broken on your side.</p>
                        <button className="sp-button" type="button" onClick={() => setRetryCount((value) => value + 1)}>Try again</button>
                    </div>
                )}

                {viewState === "empty" && (
                    <div className="sp-state">
                        <h3>No courses are available yet.</h3>
                        <p>The catalogue is connected and working. Check back soon for the next release.</p>
                    </div>
                )}

                {viewState === "success" && visibleCourses.length === 0 && (
                    <div className="sp-state">
                        <h3>No courses match “{query}”.</h3>
                        <p>Try a broader search or clear the current filter.</p>
                        <button className="sp-button" type="button" onClick={() => setQuery("")}>Clear search</button>
                    </div>
                )}

                {viewState === "success" && visibleCourses.length > 0 && (
                    <div className="sp-grid">
                        {visibleCourses.map((course, index) => (
                            <article className="sp-card" key={course.courseCode || course.mangoId}>
                                <div className="sp-card-top">
                                    <span className="sp-index">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="sp-badges">
                                        <span className="sp-badge">{course.mainCategory}</span>
                                        {course.refundable && <span className="sp-badge sp-refund">Refundable</span>}
                                    </div>
                                </div>
                                <h3 className="sp-card-title">{course.courseName}</h3>
                                <p className="sp-description">{course.description}</p>
                                <div className="sp-card-spacer" />
                                <div className="sp-price-wrap">
                                    <p className="sp-price-label">Course price</p>
                                    <p className="sp-price">{formatPrice(course, country)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

addPropertyControls<SkillpathCoursesProps>(SkillpathCourses, {
    sectionTitle: {
        type: ControlType.String,
        title: "Section Title",
        defaultValue: "Courses for useful, real-world work.",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#FF3C00",
    },
})
