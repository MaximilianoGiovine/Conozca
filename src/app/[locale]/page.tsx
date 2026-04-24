export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import PageShell from '@/components/magazine/PageShell'
import { articleService } from '@/features/blog/services/articleService'
import { NewsletterForm } from '@/features/newsletter/components/NewsletterForm'
import styles from './page.module.css'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Hero' })

  // Fetch real articles from Supabase
  let articles: any[] = []
  try {
    articles = await articleService.getArticles(locale)
  } catch (error) {
    console.error('Error fetching articles:', error)
  }

  // Pick a random featured article — changes on every page load
  const shuffled = [...articles].sort(() => Math.random() - 0.5)
  const mainFeatured = shuffled[0] ?? null
  const featuredArticles = shuffled.slice(1, 4)      // next 3 random
  const latestArticles = articles.slice(0, 4)         // most recent 4 by date

  return (
    <PageShell className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>{t('badge')}</p>
            <h1 className={styles.heroTitle}>
              {t('headline')}
            </h1>
            <p className={styles.heroLead}>
              {t('subheadline')}
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/blog">
                {t('ctaText')}
              </Link>
              <Link className={styles.secondaryButton} href="/blog">Ver destacados</Link>
            </div>

          </div>

          <div className={styles.heroCard}>
            <div className={styles.cardLabel}>Destacado</div>
            <h2 className={styles.cardTitle}>
              {mainFeatured?.translation?.title || t('noArticles')}
            </h2>
            <p className={styles.cardSummary}>
              {mainFeatured?.translation?.excerpt || "Periodismo independiente, cultura y diseño para una lectura pausada."}
            </p>
            <div className={styles.cardFooter}>
              <div className={styles.authorStack}>
                <span className={styles.authorAvatar} />
                {mainFeatured?.author_name && (
                    <span className="text-sm font-medium text-gray-700">{mainFeatured.author_name}</span>
                )}
              </div>
              {mainFeatured ? (
                <Link className={styles.textButton} href={`/blog/${mainFeatured.slug}`}>
                  Leer historia
                </Link>
              ) : (
                <Link className={styles.textButton} href="/blog">
                  Ir al blog
                </Link>
              )}
            </div>
          </div>
        </section>

        <section id="featured" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Ensayos destacados</h3>
            <Link href="/blog" className={styles.ghostButton}>Ver todos</Link>
          </div>
          <div className={styles.featureGrid}>
            {featuredArticles.length > 0 ? (
              featuredArticles.map((item) => (
                <article key={item.id} className={styles.featureCard}>
                  <p className={styles.featureTag}>Insight</p>
                  <h4>{item.translation?.title}</h4>
                  <p>
                    {item.translation?.excerpt || "Análisis calmado y preciso con detalles para mentes enfocadas."}
                  </p>
                  <div className={styles.cardFooter}>
                    <div className="text-xs text-gray-500 font-medium my-auto">
                        {item.author_name ? `Por ${item.author_name}` : ''}
                    </div>
                    <Link className={styles.textButton} href={`/blog/${item.slug}`}>
                      Abrir
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 italic">
                {t('noFeatured')}
              </div>
            )}
          </div>
        </section>

        <section id="latest" className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <h3>Últimas actualizaciones</h3>
            <Link href="/blog" className={styles.ghostButton}>Explorar archivo</Link>
          </div>
          <div className={styles.latestGrid}>
            {latestArticles.length > 0 ? (
              latestArticles.map((item) => (
                <article key={item.id} className={styles.latestCard}>
                  <span className={styles.latestTag}>Editorial</span>
                  <h4>{item.translation?.title}</h4>
                  {item.author_name && <p className="text-xs text-gray-500 mb-2">Por {item.author_name}</p>}
                  <Link className={styles.textButton} href={`/blog/${item.slug}`}>
                    Leer
                  </Link>
                </article>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 italic">
                {t('noLatest')}
              </div>
            )}
          </div>
        </section>

        <section id="about" className={styles.newsletter}>
          <div>
            <h3>Suscríbete a nuestro Newsletter</h3>
            <p>
              Suscríbete para recibir novedades de Conozca directamente en tu correo.
            </p>
          </div>
          <div className={styles.newsletterForm}>
            <NewsletterForm />
          </div>
        </section>
      </main>
    </PageShell>
  )
}
