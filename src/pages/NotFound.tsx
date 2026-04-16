import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-primary/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Desculpe, não conseguimos encontrar a página que você está procurando. Talvez ela tenha
          sido movida ou deletada.
        </p>
        <Button asChild size="lg">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
