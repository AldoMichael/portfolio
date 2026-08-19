import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { BackToTop } from './components/BackToTop'
import { CustomCursor } from './components/CustomCursor'
import { Footer } from './components/Footer'
import { Loader } from './components/Loader'
import { Navbar } from './components/Navbar'
import { ScrollProgress } from './components/ScrollProgress'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Journey } from './sections/Journey'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'

export default function App() {
  const [loading, setLoading] = useState(true)

  // Bloque le défilement tant que l'écran de chargement est affiché
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
  }, [loading])

  const handleLoaderComplete = useCallback(() => setLoading(false), [])

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" onComplete={handleLoaderComplete} />}
      </AnimatePresence>

      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Journey />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </>
  )
}
