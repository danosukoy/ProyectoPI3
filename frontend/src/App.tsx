import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Shield, 
  HelpCircle, 
  BookOpen, 
  AlertCircle,
  Loader2,
  Laptop
} from 'lucide-react';

import logo from './assets/logo.png';
import students from './assets/students.png';
import Dashboard from './Dashboard';
import api from './services/api';

interface UserData {
  username: string;
  email: string;
  role?: string;
}

export default function App() {
  // Session state (persists on device using localStorage)
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Initialize official Google Sign-In button and One Tap prompt
  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (g) {
        g.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '988062174173-r6h3ccaujcl3rv8ap8s32rnnrnu3tuho.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        g.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: '320', // Width matches login card style
            text: 'signin_with',
            shape: 'pill',
          }
        );

        // Prompts Google One Tap
        g.accounts.id.prompt();
      }
    };

    if ((window as any).google) {
      initializeGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogle);
      }
    }
  }, []);

  // Handle callback when Google responds with credential ID Token
  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await api.post('/auth/google', {
        idToken: response.credential
      });
      
      const { token, username, email, role } = apiResponse.data;
      
      localStorage.setItem('token', token);
      
      const loggedUser: UserData = {
        username: username || 'Usuario de UTEC',
        email: email || 'usuario@utec.edu.pe',
        role: role || 'ROLE_PARTICIPANT'
      };
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      console.error('Error connecting to backend:', err);
      let msg = 'Error de conexión con Google. Por favor, verifique su conexión e intente nuevamente.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Login flow simulation - bypass login for local testing
  const handleMockGoogleBtnClick = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching authentication token from local Spring Boot backend by passing the Google ID Token
      const response = await api.post('/auth/google', {
        idToken: 'mock-google-token'
      });
      
      const { token, username, email, role } = response.data;
      
      // Store token in browser local storage for authenticated header interceptor injection
      localStorage.setItem('token', token);
      
      const loggedUser: UserData = {
        username: username || 'Nubia Elena',
        email: email || 'nubia.elena@utec.edu.pe',
        role: role || 'ROLE_PARTICIPANT'
      };
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      let msg = 'Error de conexión. Por favor, verifique que el servidor esté activo e intente nuevamente.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // If user is logged in, show Dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      
      {/* Decorative blurred background shapes matching exact branding */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[color:var(--brand-green)] opacity-20 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-[color:var(--brand-purple)] opacity-25 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-[color:var(--brand-blue)] opacity-20 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-6">
        
        <header className="flex items-center justify-between">
          <img src={logo} alt="UTEC Conexión" className="h-12 sm:h-14 w-auto select-none object-contain" draggable="false" />
          
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline">¿Necesitas ayuda?</span>
          </button>
        </header>
        
        {/* Main Grid Section */}
        <main className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14 items-start">
          
          {/* LEFT COLUMN: AUTHENTICATION (GOOGLE LOGIN CARD) */}
          <section className="rounded-3xl bg-card shadow-card border border-border/60 p-8 sm:p-10 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-brand">
                Crea tu cuenta
              </h1>
              
              <p className="mt-4 text-muted-foreground max-w-xs leading-relaxed">
                Únete a UTEC Conexión y comienza a aprender, colaborar y crecer.
              </p>

              {error && (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 w-full">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Real Google Login Button container and Mock Bypass */}
              <div className="mt-10 w-full flex flex-col items-center gap-5">
                {loading ? (
                  <div className="inline-flex items-center justify-center gap-3 py-3.5">
                    <Loader2 className="h-5 w-5 animate-spin text-[color:var(--brand-orange)]" />
                    <span className="text-sm font-medium text-muted-foreground">Procesando inicio de sesión...</span>
                  </div>
                ) : (
                  <div id="google-signin-btn" className="w-full flex justify-center"></div>
                )}
                
                <button 
                  onClick={handleMockGoogleBtnClick}
                  disabled={loading}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer disabled:opacity-50"
                >
                  [Bypass Desarrollo] Iniciar sesión simulada
                </button>
              </div>

              <p className="mt-10 text-xs text-muted-foreground leading-relaxed max-w-xs">
                Al continuar, aceptas los{" "}
                <a href="#" className="text-[color:var(--brand-purple)] font-medium hover:underline">
                  Términos de Servicio
                </a>
                {" "}y la{" "}
                <a href="#" className="text-[color:var(--brand-purple)] font-medium hover:underline">
                  Política de Privacidad
                </a>
                {" "}de UTEC Conexión.
              </p>
            </div>
          </section>

          {/* RIGHT COLUMN: ESSENCE & STORYBOARD OVERVIEW */}
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] items-start">
            <div>
              <p className="text-[color:var(--brand-green)] font-semibold">Bienvenido a</p>
              
              <h2 className="mt-1 text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-brand">
                UTEC Conexión
              </h2>
              
              <p className="mt-4 text-muted-foreground max-w-lg leading-relaxed">
                Un espacio donde estudiantes como tú se conectan, comparten conocimientos y construyen juntos un mejor aprendizaje.
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-6">
                <li className="flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow-soft" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-green) 15%, white)' }}>
                    <Users className="h-5 w-5" style={{ color: 'var(--brand-green)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ color: 'var(--brand-green)' }}>¿Quiénes somos?</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Somos una plataforma creada para estudiantes que buscan colaborar, aprender y crecer juntos.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow-soft" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-blue) 15%, white)' }}>
                    <MessageCircle className="h-5 w-5" style={{ color: 'var(--brand-blue)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ color: 'var(--brand-blue)' }}>¿Qué hace la página?</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Facilitamos la creación de grupos de estudio, el intercambio de recursos y la organización de proyectos académicos.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow-soft" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-purple) 15%, white)' }}>
                    <Laptop className="h-5 w-5" style={{ color: 'var(--brand-purple)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ color: 'var(--brand-purple)' }}>¿Para quién es?</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Para estudiantes de todas las carreras que quieren potenciar su aprendizaje en comunidad.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow-soft" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-green) 15%, white)' }}>
                    <Shield className="h-5 w-5" style={{ color: 'var(--brand-green)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" style={{ color: 'var(--brand-green)' }}>¿Por qué elegirnos?</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Porque aprender acompañado es más fácil, más dinámico y mucho más efectivo.
                    </p>
                  </div>
                </li>
              </ul>

              {/* Safety notice */}
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[color:var(--brand-green)]/30 bg-[color:var(--brand-green)]/10 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-[color:var(--brand-green)]/20 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-[color:var(--brand-green)]" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Tu información está segura con nosotros.</p>
                  <p className="text-muted-foreground mt-0.5">Nos tomamos tu privacidad muy en serio.</p>
                </div>
              </div>
            </div>

            {/* Orbiting side graphic */}
            <div className="relative lg:sticky lg:top-8">
              <div className="relative aspect-square max-w-sm mx-auto">
                <div className="absolute inset-8 rounded-full bg-gradient-brand opacity-20 blur-2xl"></div>
                <div className="absolute inset-12 rounded-full border-2 border-dashed border-[color:var(--brand-blue)]/30 animate-[spin_30s_linear_infinite]"></div>
                
                {/* Center circle */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] h-20 w-20 rounded-full bg-gradient-brand flex items-center justify-center shadow-card">
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center">
                    <MessageCircle className="h-7 w-7 text-[color:var(--brand-blue)] fill-[color:var(--brand-blue)]" />
                  </div>
                </div>

                {/* Floating tags with light theme background */}
                <div className="absolute top-4 right-2 h-12 w-12 rounded-full bg-white shadow-card flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[color:var(--brand-purple)]" />
                </div>
                
                <div className="absolute top-1/2 right-0 h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-[color:var(--brand-blue)]" />
                </div>
                
                <div className="absolute top-1/3 left-0 h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center">
                  <Users className="h-4 w-4 text-[color:var(--brand-green)]" />
                </div>

                <img 
                  src={students} 
                  alt="Estudiantes colaborando en UTEC Conexión" 
                  width="1024" 
                  height="1024" 
                  loading="lazy" 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[88%] drop-shadow-2xl select-none" 
                  draggable="false"
                />
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="mt-16 pb-6 text-center text-xs text-muted-foreground">
          © 2026 UTEC Conexión. Todos los derechos reservados.
        </footer>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200 border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Soporte UTEC Conexión</h3>
            <p className="text-xs leading-relaxed mb-4 text-muted-foreground">
              Si tienes problemas para acceder a tu cuenta institucional, por favor recuerda:
            </p>
            <ul className="text-[11px] list-disc pl-4 space-y-2 mb-6 text-muted-foreground">
              <li>El sistema solo admite cuentas institucionales autorizadas.</li>
              <li>Tu contraseña debe coincidir con la de tu cuenta de correo UTEC.</li>
              <li>Si olvidaste tu contraseña institucional, debes restablecerla en el portal de UTEC.</li>
            </ul>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowHelp(false)}
                className="rounded-xl bg-gradient-brand text-white text-xs font-semibold px-4 py-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
