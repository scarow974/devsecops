import { Store, Shield, Sparkles, Headphones, ShoppingBag, ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function MarketFlowLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">MarketFlow</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Collection
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              À propos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              Connexion
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Inscription
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Découvrez l'élégance sur <span className="text-accent">MarketFlow</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
            Une sélection curée de produits uniques, conçus pour inspirer et ravir. Explorez un monde de qualité et de
            style.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <ShoppingBag className="h-5 w-5" />
              Découvrir la collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 bg-transparent"
            >
              <Sparkles className="h-5 w-5" />
              Devenir membre
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-serif text-3xl font-semibold text-center text-foreground mb-16">Pourquoi MarketFlow ?</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: "Qualité Exceptionnelle",
                description: "Nous sélectionnons des produits d'exception pour leur design et leur durabilité.",
              },
              {
                icon: Shield,
                title: "Transactions Sécurisées",
                description: "Profitez d'un environnement d'achat et de vente protégé et fiable.",
              },
              {
                icon: Store,
                title: "Découvertes Uniques",
                description: "Trouvez des articles rares et originaux, loin des sentiers battus.",
              },
              {
                icon: Headphones,
                title: "Support Dédié",
                description: "Notre équipe est là pour vous accompagner à chaque étape.",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-border bg-background hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Prêt à rejoindre MarketFlow ?</h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez notre communauté de passionnés. Créez votre compte gratuitement et commencez à explorer dès
            maintenant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              <User className="h-5 w-5" />
              Créer un compte gratuit
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Explorer la collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-3xl px-6">
          <Card className="border-border">
            <CardContent className="pt-6">
              <h3 className="font-serif text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
                <span className="text-primary">🔑</span> Comptes de démonstration
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    role: "Client",
                    email: "client@marketflow.com",
                    pass: "client123",
                    color: "bg-primary/10 text-primary",
                  },
                  {
                    role: "Vendeur",
                    email: "vendeur@marketflow.com",
                    pass: "vendeur123",
                    color: "bg-accent/20 text-accent-foreground",
                  },
                  {
                    role: "Admin",
                    email: "admin@marketflow.com",
                    pass: "admin123",
                    color: "bg-destructive/10 text-destructive",
                  },
                ].map((account, index) => (
                  <div key={index} className="rounded-lg bg-muted p-4 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium mb-2 ${account.color}`}>
                      {account.role}
                    </span>
                    <p className="text-sm font-medium text-foreground">{account.email}</p>
                    <p className="text-xs text-muted-foreground">{account.pass}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-serif text-xl font-semibold text-primary-foreground">MarketFlow</span>
              </div>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                Une sélection curée de produits d'exception pour les amateurs de qualité et d'élégance.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-primary-foreground mb-4">Navigation</h4>
              <ul className="space-y-2">
                {["Accueil", "Collection", "À propos", "Contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aide */}
            <div>
              <h4 className="font-semibold text-primary-foreground mb-4">Aide</h4>
              <ul className="space-y-2">
                {["FAQ", "Livraison", "Retours", "Support"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-primary-foreground mb-4">Légal</h4>
              <ul className="space-y-2">
                {["CGV", "Confidentialité", "Mentions légales"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
            <p className="text-sm text-primary-foreground/50">
              © 2025 MarketFlow. Tous droits réservés. Application créée avec pywebview.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
