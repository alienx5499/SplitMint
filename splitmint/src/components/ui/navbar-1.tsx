import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, User, Settings, LogOut, Copy, ExternalLink, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"
import { LiquidButton } from "./liquid-glass-button"
import { Logo } from "./logo"
import { AuthModal } from "./AuthModal"
import { useAuth } from "@/contexts/AuthContext"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuthenticated, user, login, logout, isLoading, authMethod } = useAuth()
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen)
  
  const handleAuthLogin = (method: 'email' | 'gmail') => {
    login(method)
  }

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@')
    return `${username.slice(0, 3)}***@${domain}`
  }

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email)
      toast.success("Email copied to clipboard!", {
        description: user.email
      })
    }
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      if (typeof document !== 'undefined') {
        document.addEventListener('mousedown', handleClickOutside)
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isProfileOpen])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' }
  ]

  const handleNavClick = (item: string) => {
    if (item === 'Home') {
      router.push('/')
    } else {
      // Scroll to section on landing page
      router.push('/')
      setTimeout(() => {
        const element = typeof window !== 'undefined' ? document.getElementById(item.toLowerCase()) : null
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-white rounded-full shadow-lg w-full max-w-3xl relative border border-gray-200 navbar-white">
        <div className="flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button onClick={() => router.push('/')} className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-2xl font-semibold text-gray-900 tracking-tight">SplitMint</span>
            </button>
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                onClick={() => handleNavClick(item.name)}
                className={`text-sm transition-colors font-medium ${
                  pathname === item.path 
                    ? 'text-blue-600' 
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                {item.name}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth Button */}
        <motion.div
          className="hidden md:block relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <LiquidButton
                onClick={toggleProfile}
                size="sm"
                className="px-5 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-xs">{formatEmail(user!.email)}</span>
                </div>
              </LiquidButton>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {/* Account Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {authMethod === 'gmail' ? 'Gmail' : 'Email'} Account
                          </div>
                          <div className="text-xs text-gray-500">{user!.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 py-2 space-y-1">
                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={copyEmail}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Email
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-3 w-3" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <LiquidButton 
              size="sm" 
              className="px-5 py-2 text-sm text-blue-600"
              onClick={() => setIsAuthModalOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </LiquidButton>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-gray-900" />
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-xl shadow-lg border border-gray-200 py-4 z-50 md:hidden"
          >
            <div className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                <button onClick={toggleMenu} className="p-1">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => handleNavClick(item.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.path
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Auth Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatEmail(user!.email)}
                      </span>
                    </div>
                    <LiquidButton 
                      size="lg" 
                      className="w-full px-5 py-3 text-base text-blue-600"
                      onClick={() => {
                        router.push('/dashboard');
                        toggleMenu();
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </LiquidButton>
                    <LiquidButton 
                      size="lg" 
                      className="w-full px-5 py-3 text-base"
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                    >
                      Sign Out
                    </LiquidButton>
                  </div>
                ) : (
                  <LiquidButton 
                    size="lg" 
                    className="w-full px-5 py-3 text-base text-blue-600"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      toggleMenu();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </LiquidButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auth Selection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleAuthLogin}
      />
    </div>
  )
}

export { Navbar1 }