import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Github, Linkedin, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Magnetic } from '../components/Magnetic'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { profile } from '../data/portfolio'
import { useContent } from '../context/ContentContext'
import { ApiError, apiRequest } from '../lib/api'
import { EXTERNAL_LINK_PROPS, safeUrl } from '../lib/links'
import { EASE } from '../lib/motion'

type FormFields = {
  name: string
  email: string
  subject: string
  message: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Validation en temps réel des champs du formulaire. */
function validate(values: FormFields): FormErrors {
  const errors: FormErrors = {}

  if (values.name.trim().length < 2) errors.name = 'Merci d’indiquer votre nom (2 caractères min.).'
  if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Adresse e-mail invalide.'
  if (values.subject.trim().length < 3) errors.subject = 'Sujet trop court.'
  if (values.message.trim().length < 10)
    errors.message = 'Votre message doit contenir au moins 10 caractères.'

  return errors
}

const socialIcons = { linkedin: Linkedin, github: Github, mail: Mail, phone: Phone }

export function Contact() {
  const { socials } = useContent()
  const visibleSocials = socials.filter((social) => safeUrl(social.href))
  const [values, setValues] = useState<FormFields>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field: keyof FormFields) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setValues((previous) => ({ ...previous, [field]: event.target.value }))

  const handleBlur = (field: keyof FormFields) => () =>
    setTouched((previous) => ({ ...previous, [field]: true }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })
    if (!isValid || sending) return

    setSending(true)
    setSubmitError(null)
    try {
      await apiRequest('/api/contact', {
        method: 'POST',
        body: { ...values, website: honeypotRef.current?.value ?? '' },
      })
      setSent(true)
      setValues({ name: '', email: '', subject: '', message: '' })
      setTouched({})
      window.setTimeout(() => setSent(false), 6000)
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Impossible d’envoyer le message. Réessayez dans un instant.',
      )
    } finally {
      setSending(false)
    }
  }

  const contactCards = [
    { icon: Phone, label: 'Téléphone', value: profile.phone, href: `tel:${profile.phoneHref}` },
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: MapPin, label: 'Localisation', value: profile.location, href: undefined },
  ]

  return (
    <Section
      id="contact"
      eyebrow="07 — Contact"
      title={'Un projet en tête\u00A0? Parlons-en.'}
      description="Disponible pour des missions freelance, des collaborations à distance ou un poste en équipe."
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        {/* Coordonnées */}
        <div className="space-y-4">
          {contactCards.map((card, index) => {
            const Icon = card.icon
            const content = (
              <div className="glass-card group flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/35">{card.label}</p>
                  <p className="truncate text-sm text-ink/80">{card.value}</p>
                </div>
              </div>
            )

            return (
              <Reveal key={card.label} delay={index * 0.1}>
                {card.href ? (
                  <a href={card.href} className="block">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </Reveal>
            )
          })}

          {visibleSocials.length > 0 && (
          <Reveal delay={0.3}>
            <div className="glass-card p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-ink/35">Réseaux</p>
              <div className="flex gap-3">
                {visibleSocials.map((social) => {
                  const Icon = socialIcons[social.icon]
                  const href = safeUrl(social.href)
                  if (!href) return null
                  return (
                    <a
                      key={social.label}
                      href={href}
                      {...EXTERNAL_LINK_PROPS}
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 text-ink/60 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </Reveal>
          )}
        </div>

        {/* Formulaire */}
        <Reveal x={24} y={0} delay={0.1}>
          <div className="glass-card relative overflow-hidden p-6 sm:p-8">
            {/* État de succès animé */}
            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-page-2/95 backdrop-blur-sm"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.span>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {'Message envoyé\u00A0!'}
                  </h3>
                  <p className="max-w-xs text-center text-sm text-ink/55">
                    Merci. Je vous réponds généralement sous 48 h.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot anti-spam, invisible pour les humains */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                <label htmlFor="website">Site web</label>
                <input
                  ref={honeypotRef}
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Nom complet"
                  placeholder="Votre nom"
                  value={values.name}
                  error={touched.name ? errors.name : undefined}
                  valid={touched.name && !errors.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                />
                <Field
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="vous@exemple.com"
                  value={values.email}
                  error={touched.email ? errors.email : undefined}
                  valid={touched.email && !errors.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                />
              </div>

              <Field
                id="subject"
                label="Sujet"
                placeholder="Objet de votre message"
                value={values.subject}
                error={touched.subject ? errors.subject : undefined}
                valid={touched.subject && !errors.subject}
                onChange={handleChange('subject')}
                onBlur={handleBlur('subject')}
              />

              <Field
                id="message"
                label="Message"
                placeholder="Décrivez votre projet, vos besoins, votre délai…"
                textarea
                value={values.message}
                error={touched.message ? errors.message : undefined}
                valid={touched.message && !errors.message}
                onChange={handleChange('message')}
                onBlur={handleBlur('message')}
              />

              {submitError && (
                <p className="text-sm text-rose-400" role="alert">
                  {submitError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Magnetic>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!isValid || sending}
                  >
                    {sending ? 'Envoi…' : 'Envoyer le message'}
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </motion.button>
                </Magnetic>

                <p className="text-xs text-ink/35">
                  Réponse sous 48 h — ou écrivez directement à{' '}
                  <a href={`mailto:${profile.email}`} className="link-underline text-ink/60">
                    {profile.email}
                  </a>
                </p>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

type FieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  type?: string
  textarea?: boolean
  error?: string
  valid?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur: () => void
}

/** Champ de formulaire avec état de validation animé. */
function Field({
  id,
  label,
  placeholder,
  value,
  type = 'text',
  textarea = false,
  error,
  valid,
  onChange,
  onBlur,
}: FieldProps) {
  const baseClass = `peer w-full rounded-xl border bg-ink/[0.03] px-4 py-3 text-sm text-ink placeholder:text-ink/25 transition-colors duration-300 focus:outline-none ${
    error
      ? 'border-rose-500/60 focus:border-rose-400'
      : valid
        ? 'border-emerald-500/50 focus:border-emerald-400'
        : 'border-ink/10 focus:border-accent/70'
  }`

  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink/40">
        {label}
        {valid && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
      </label>

      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`${baseClass} resize-none`}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={baseClass}
          aria-invalid={Boolean(error)}
        />
      )}

      {/* Message d'erreur animé */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-1.5 overflow-hidden text-xs text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
