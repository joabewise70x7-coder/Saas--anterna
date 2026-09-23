import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function asError(error: unknown) {
  return error instanceof Error ? error : new Error('Não foi possível concluir a operação.')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        setLoading(false)
        return
      }
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    configured: Boolean(supabase),
    async signIn(email, password) {
      if (!supabase) return { error: new Error('Supabase não está configurado.') }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? asError(error) : null }
    },
    async signUp(email, password, fullName) {
      if (!supabase) return { error: new Error('Supabase não está configurado.'), needsEmailConfirmation: false }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() || null },
        },
      })

      return {
        error: error ? asError(error) : null,
        needsEmailConfirmation: Boolean(data.user && !data.session),
      }
    },
    async signOut() {
      if (!supabase) return { error: new Error('Supabase não está configurado.') }
      const { error } = await supabase.auth.signOut()
      return { error: error ? asError(error) : null }
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
