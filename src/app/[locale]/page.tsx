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
  let articles = []
  try {
    articles = await articleService.getArticles(locale)
  } catch (error) {
    console.error('Error fetching articles:', error)
  }

  const featuredArticles = articles.filter(a => a.is_featured).slice(0, 3)
  const latestArticles = articles.filter(a => !a.is_featured).slice(0, 4)
  const mainFeatured = featuredArticles[0]

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
            <div className={styles.heroMeta}>
              <div>
                <span className={styles.metaLabel}>Edición</span>
                <span className={styles.metaValue}>No. 12</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Frecuencia</span>
                <span className={styles.metaValue}>Semanal</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Editores</span>
                <span className={styles.metaValue}>Conozca Team</span>
              </div>
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
            <h3>Suscríbete a la edición dominical</h3>
            <p>
              Un correo por semana. Historias, entrevistas y notas desde la mesa editorial.
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
