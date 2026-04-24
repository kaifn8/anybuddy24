import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore, createDefaultUser } from '@/store/useAppStore';
import type { Category, Gender } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

// Streamlined signup: method → contact → password → identity → interests → location
type Step = 'method' | 'contact' | 'password' | 'identity' | 'interests' | 'location';
const steps: Step[] = ['method', 'contact', 'password', 'identity', 'interests', 'location'];

const interestOptions: { id: Category; label: string }[] = [
  { id: 'chai', label: 'Coffee / Chai' },
  { id: 'food', label: 'Food' },
  { id: 'casual', label: 'Drinks' },
  { id: 'sports', label: 'Sports' },
  { id: 'walk', label: 'Walks' },
  { id: 'explore', label: 'Explore' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'work', label: 'Work / Study' },
  { id: 'help', label: 'Games' },
];

const cities = [
  { name: 'Mumbai', emoji: '🌆', zones: ['Bandra', 'Andheri', 'Colaba', 'Juhu', 'Powai', 'Lower Parel', 'Worli', 'Dadar'] },
  { name: 'Navi Mumbai', emoji: '🏙️', zones: ['Vashi', 'Nerul', 'Kharghar', 'Belapur', 'Panvel', 'Airoli', 'Sanpada'] },
  { name: 'Thane', emoji: '🌳', zones: ['Ghodbunder', 'Hiranandani', 'Majiwada', 'Naupada', 'Kopri', 'Vartak Nagar'] },
];

const stepConfig: Record<Step, { emoji: string; title: string; subtitle: string }> = {
  method: { emoji: '👋', title: "Let's get you in", subtitle: '30 seconds. No spam, ever.' },
  contact: { emoji: '📱', title: '', subtitle: '' }, // dynamic
  password: { emoji: '🔐', title: 'Create a password', subtitle: 'At least 6 characters' },
  identity: { emoji: '😊', title: "Who are you?", subtitle: "Your name and how you identify" },
  interests: { emoji: '🎯', title: 'What gets you out?', subtitle: 'Pick 3–5 to see relevant plans' },
  location: { emoji: '📍', title: 'Your area', subtitle: "We'll show plans near you" },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();

  const [step, setStep] = useState<Step>('method');
  const [loginMethod, setLoginMethod] = useState<'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [interests, setInterests] = useState<Category[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [zone, setZone] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);

  // If a session already exists (e.g. returning from Google), skip ahead.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Check if profile is complete
        supabase.from('profiles').select('name, zone').eq('user_id', data.session.user.id).maybeSingle()
          .then(({ data: p }) => {
            if (p?.name && p?.zone) {
              setOnboarded(true);
              navigate('/home');
            } else {
              setStep('identity');
            }
          });
      }
    });
  }, [navigate, setOnboarded]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    }
  }, [step]);

  const goToStep = (nextStep: Step) => {
    gsap.to(contentRef.current, { opacity: 0, y: -12, duration: 0.15, onComplete: () => setStep(nextStep) });
  };

  const toggleInterest = (cat: Category) => {
    setInterests(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat);
      if (prev.length >= 5) return prev;
      return [...prev, cat];
    });
  };

  const handleAuthSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/signup` },
        });
        if (error) throw error;
        // Email confirm may be required; if a session exists we proceed
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          goToStep('identity');
        } else {
          toast.success('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        goToStep('identity');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/signup`,
    });
    if (result.error) {
      toast.error('Google sign-in failed');
    }
  };

  const handleComplete = async () => {
    if (!(interests.length >= 3 && zone && firstName.trim() && gender)) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      toast.error('Session expired, please sign in again.');
      goToStep('method');
      return;
    }
    const { error } = await supabase.from('profiles').update({
      name: firstName,
      gender,
      interests,
      zone,
    }).eq('user_id', uid);
    if (error) {
      toast.error(error.message);
      return;
    }
    gsap.to(contentRef.current, {
      opacity: 0, duration: 0.2, onComplete: () => {
        setUser(createDefaultUser({
          id: uid, firstName, phone: '', email, gender: gender || undefined,
          ageRange: '25-34', city: selectedCity || 'Mumbai', zone, interests, loginMethod: 'email',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        }));
        setOnboarded(true);
        navigate('/home');
      },
    });
  };

  const stepIndex = steps.indexOf(step);

  // Dynamic config for contact step
  const getConfig = () => {
    if (step === 'contact') {
      return mode === 'signup'
        ? { emoji: '✉️', title: 'Your email', subtitle: 'We\'ll use this to sign you in.' }
        : { emoji: '👋', title: 'Welcome back', subtitle: 'Sign in to continue.' };
    }
    return stepConfig[step];
  };
  const config = getConfig();

  return (
    <div className="mobile-container flex flex-col bg-ambient" style={{ minHeight: '100dvh' }}>
      <div className="flex-1 px-6 pt-8 pb-6 overflow-y-auto">
        {/* Progress bar */}
        {step !== 'method' && (
          <div className="flex gap-1 mb-10">
            {steps.slice(1).map((_, i) => (
              <div key={i} className={cn(
                'h-0.5 rounded-full flex-1 transition-all duration-300',
                i < stepIndex ? 'bg-primary' : 'bg-muted-foreground/12'
              )} />
            ))}
          </div>
        )}

        <div ref={contentRef}>
          <div className="mb-8">
            <span className="text-3xl block mb-3">{config.emoji}</span>
            <h1 className="text-heading font-bold text-foreground">{config.title}</h1>
            {config.subtitle && <p className="text-sm text-muted-foreground mt-1.5">{config.subtitle}</p>}
          </div>

          {/* ── Step: Auth method ── */}
          {step === 'method' && (
            <div className="space-y-3">
              <button onClick={handleGoogle}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">🟢</span>
                <div><p className="text-sm font-semibold">Continue with Google</p><p className="text-2xs text-muted-foreground">One tap, no password</p></div>
              </button>
              <button onClick={() => { setMode('signup'); goToStep('contact'); }}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">✉️</span>
                <div><p className="text-sm font-semibold">Sign up with Email</p><p className="text-2xs text-muted-foreground">Email & password</p></div>
              </button>
              <button onClick={() => { setMode('signin'); goToStep('contact'); }}
                className="w-full text-center pt-2 text-xs text-muted-foreground hover:text-foreground tap-scale">
                Already have an account? <span className="text-primary font-semibold">Sign in</span>
              </button>
            </div>
          )}

          {/* ── Step: Contact (email) ── */}
          {step === 'contact' && (
            <div className="space-y-5">
              <input type="email" inputMode="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              <Button className="w-full h-12" onClick={() => email.includes('@') && goToStep('password')} disabled={!email.includes('@')}>Continue</Button>
            </div>
          )}

          {/* ── Step: Password ── */}
          {step === 'password' && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground -mt-4">{email}</p>
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              <Button className="w-full h-12" onClick={handleAuthSubmit} disabled={password.length < 6 || submitting}>
                {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </Button>
            </div>
          )}

          {/* ── Step: Identity (name + gender combined) ── */}
          {step === 'identity' && (
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">First name</label>
                <input placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                  className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">I identify as</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { id: 'male' as Gender, emoji: '👨', label: 'Male' },
                    { id: 'female' as Gender, emoji: '👩', label: 'Female' },
                    { id: 'other' as Gender, emoji: '🧑', label: 'Other' },
                  ]).map((g) => (
                    <button key={g.id} onClick={() => setGender(g.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all tap-scale',
                        gender === g.id
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : 'border-border/30 bg-background/50 hover:border-border/50'
                      )}>
                      <span className="text-2xl">{g.emoji}</span>
                      <span className={cn('text-sm font-semibold', gender === g.id ? 'text-primary' : 'text-foreground')}>{g.label}</span>
                      {gender === g.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                          <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full h-12" onClick={() => firstName.trim() && gender && goToStep('interests')} disabled={!firstName.trim() || !gender}>
                Continue
              </Button>
            </div>
          )}

          {/* ── Step: Interests ── */}
          {step === 'interests' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {interestOptions.map((item) => {
                  const selected = interests.includes(item.id);
                  const isMaxed = interests.length >= 5 && !selected;
                  return (
                    <button key={item.id} onClick={() => !isMaxed && toggleInterest(item.id)} disabled={isMaxed}
                      className={cn(
                        'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 tap-scale text-left',
                        selected ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : isMaxed ? 'border-border/20 bg-muted/30 opacity-50 cursor-not-allowed'
                          : 'border-border/30 bg-background/50 hover:border-border/50'
                      )}>
                      <CategoryIcon category={item.id} size="sm" />
                      <span className={cn('text-[13px] font-semibold flex-1', selected ? 'text-primary' : 'text-foreground')}>{item.label}</span>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                          <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={cn('w-2.5 h-2.5 rounded-full transition-all duration-300', interests.length >= n ? 'bg-primary scale-100' : 'bg-muted-foreground/20 scale-75')} />
                ))}
                <span className="text-[11px] text-muted-foreground ml-1.5">
                  {interests.length < 3 ? `${3 - interests.length} more to go` : interests.length < 5 ? `${interests.length} selected` : 'Max selected'}
                </span>
              </div>

              {interests.length >= 3 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20 animate-fade-in">
                  <span className="text-success">✓</span>
                  <p className="text-[11px] text-success font-medium">Great picks! We'll match you to these.</p>
                </div>
              )}

              <Button className="w-full h-12" onClick={() => interests.length >= 3 && goToStep('location')} disabled={interests.length < 3}>Continue</Button>
            </div>
          )}

          {/* ── Step: Location ── */}
          {step === 'location' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Select your city</p>
                <div className="flex gap-2">
                  {cities.map((city) => (
                    <button key={city.name} onClick={() => { setSelectedCity(city.name); setZone(''); }}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 transition-all tap-scale',
                        selectedCity === city.name ? 'border-primary bg-primary/10 shadow-md shadow-primary/10' : 'border-border/30 bg-background/50 hover:border-border/50'
                      )}>
                      <span className="text-2xl">{city.emoji}</span>
                      <span className={cn('text-[11px] font-semibold', selectedCity === city.name ? 'text-primary' : 'text-foreground')}>{city.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCity && (
                <div className="animate-fade-in">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Where in {selectedCity}?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.find(c => c.name === selectedCity)?.zones.map((z) => (
                      <button key={z} onClick={() => setZone(z)}
                        className={cn(
                          'flex items-center gap-2 py-2.5 px-3 rounded-xl border transition-all tap-scale text-left',
                          zone === z ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/30 bg-background/50 hover:border-border/50'
                        )}>
                        <span className={cn('w-2 h-2 rounded-full shrink-0', zone === z ? 'bg-primary' : 'bg-muted-foreground/30')} />
                        <span className={cn('text-[12px] font-medium', zone === z ? 'text-primary' : 'text-foreground')}>{z}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {zone && (
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-success/10 border border-success/20 animate-scale-in">
                  <span className="text-success text-sm">📍</span>
                  <span className="text-[12px] font-semibold text-success">{zone}, {selectedCity}</span>
                </div>
              )}

              <Button className="w-full h-12" onClick={handleComplete} disabled={!zone || interests.length < 3 || !firstName.trim() || !gender}>
                Let's Go →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
