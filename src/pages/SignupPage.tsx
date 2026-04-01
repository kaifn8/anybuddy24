import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore, createDefaultUser } from '@/store/useAppStore';
import type { Category, Gender } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/CategoryIcon';

type Step = 'method' | 'phone' | 'otp' | 'name' | 'gender' | 'photo' | 'bio' | 'age' | 'interests' | 'zone';
const steps: Step[] = ['method', 'phone', 'otp', 'name', 'gender', 'photo', 'bio', 'age', 'interests', 'zone'];
const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];

// Interest options with label
const interestOptions: { id: Category; label: string }[] = [
  { id: 'chai',     label: 'Coffee / Chai' },
  { id: 'food',     label: 'Food' },
  { id: 'casual',   label: 'Drinks' },
  { id: 'sports',   label: 'Sports' },
  { id: 'walk',     label: 'Walks' },
  { id: 'explore',  label: 'Explore' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'work',     label: 'Work / Study' },
  { id: 'help',     label: 'Games' },
];
const cities = [
  { name: 'Mumbai', emoji: '🌆', zones: ['Bandra', 'Andheri', 'Colaba', 'Juhu', 'Powai', 'Lower Parel', 'Worli', 'Dadar'] },
  { name: 'Navi Mumbai', emoji: '🏙️', zones: ['Vashi', 'Nerul', 'Kharghar', 'Belapur', 'Panvel', 'Airoli', 'Sanpada'] },
  { name: 'Thane', emoji: '🌳', zones: ['Ghodbunder', 'Hiranandani', 'Majiwada', 'Naupada', 'Kopri', 'Vartak Nagar', 'Wagle Estate'] },
];

const stepConfig: Record<Step, { emoji: string; title: string; subtitle: string }> = {
  method: { emoji: '👋', title: "Let's get you in", subtitle: '30 seconds. No spam, ever.' },
  phone: { emoji: '📱', title: 'Drop your number', subtitle: "Quick check to keep out fakes." },
  otp: { emoji: '🔐', title: 'Enter code', subtitle: '' },
  name: { emoji: '😊', title: "What's your first name?", subtitle: "This is how people will see you" },
  gender: { emoji: '🧑', title: 'How do you identify?', subtitle: 'Helps others know who they\'re meeting' },
  photo: { emoji: '📸', title: 'Add a photo', subtitle: 'Real photos get way more joins' },
  bio: { emoji: '✍️', title: 'One line about you', subtitle: 'Keep it casual. What are you into?' },
  age: { emoji: '🎂', title: 'Age range', subtitle: 'So we show you the right crowd' },
  interests: { emoji: '🎯', title: 'What gets you out of the house?', subtitle: 'Pick at least 3 or more = better matches' },
  zone: { emoji: '📍', title: 'Your area', subtitle: 'We\'ll show plans near you' },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();
  
  const [step, setStep] = useState<Step>('method');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'google' | 'apple'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [bio, setBio] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState<Category[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [zone, setZone] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    }
  }, [step]);
  
  const goToStep = (nextStep: Step) => {
    gsap.to(contentRef.current, { opacity: 0, y: -12, duration: 0.15, onComplete: () => setStep(nextStep) });
  };
  
  useEffect(() => {
    if (step === 'otp' && otp.every(d => d) && otp.join('').length === 4) goToStep('name');
  }, [otp, step]);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };
  
  const handleSocialLogin = (method: 'google' | 'apple') => {
    setLoginMethod(method);
    setFirstName(method === 'google' ? 'User' : 'User');
    goToStep('name');
  };
  
  const handleComplete = () => {
    if (interests.length >= 3 && zone) {
      gsap.to(contentRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
        setUser(createDefaultUser({
          id: `user_${Date.now()}`, firstName, phone, email, bio, gender: gender || undefined,
          ageRange, city: selectedCity || 'Mumbai', zone, interests, loginMethod,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        }));
        setOnboarded(true);
        navigate('/home');
      }});
    }
  };
  
  const toggleInterest = (cat: Category) => {
    setInterests(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      }
      if (prev.length >= 5) return prev; // Max 5
      return [...prev, cat];
    });
  };
  
  const stepIndex = steps.indexOf(step);
  const config = stepConfig[step];
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-ambient">
      <div className="flex-1 px-6 pt-8">
        {/* Progress */}
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
          
          {/* Login method */}
          {step === 'method' && (
            <div className="space-y-3">
              <button onClick={() => { setLoginMethod('phone'); goToStep('phone'); }}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">📱</span>
                <div><p className="text-sm font-semibold">Continue with Phone</p><p className="text-2xs text-muted-foreground">OTP verification</p></div>
              </button>
              <button onClick={() => { setLoginMethod('email'); goToStep('phone'); }}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">✉️</span>
                <div><p className="text-sm font-semibold">Continue with Email</p><p className="text-2xs text-muted-foreground">Magic link</p></div>
              </button>
            </div>
          )}
          
          {/* Phone */}
          {step === 'phone' && loginMethod === 'phone' && (
            <div className="space-y-5">
              <div className="flex gap-2.5">
                <div className="w-12 h-12 flex items-center justify-center liquid-glass text-lg rounded-xl">🇮🇳</div>
                <input type="tel" placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              </div>
              <Button className="w-full h-12" onClick={() => phone.length >= 10 && goToStep('otp')} disabled={phone.length < 10}>Send Code</Button>
            </div>
          )}
          
          {step === 'phone' && loginMethod === 'email' && (
            <div className="space-y-5">
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              <Button className="w-full h-12" onClick={() => email.includes('@') && goToStep('otp')} disabled={!email.includes('@')}>Send Magic Link</Button>
            </div>
          )}
          
          {/* OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground -mt-4">Sent to {loginMethod === 'phone' ? `+91 ${phone}` : email}</p>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-xl font-bold rounded-xl liquid-glass focus:ring-2 focus:ring-primary/20 focus:outline-none" autoFocus={i === 0} />
                ))}
              </div>
              <Button variant="link" className="w-full text-sm">Resend code</Button>
            </div>
          )}
          
          {/* Name */}
          {step === 'name' && (
            <div className="space-y-5">
              <input placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button className="w-full h-12" onClick={() => firstName.trim() && goToStep('gender')} disabled={!firstName.trim()}>Continue</Button>
            </div>
          )}
          
          {/* Gender */}
          {step === 'gender' && (
            <div className="space-y-5">
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
                    <span className="text-3xl">{g.emoji}</span>
                    <span className={cn('text-sm font-semibold', gender === g.id ? 'text-primary' : 'text-foreground')}>{g.label}</span>
                    {gender === g.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                        <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Button className="w-full h-12" onClick={() => gender && goToStep('photo')} disabled={!gender}>Continue</Button>
            </div>
          )}
          
          {/* Photo */}
          {step === 'photo' && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-full liquid-glass-heavy flex items-center justify-center">
                  <span className="text-4xl">📷</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full h-12">Upload Photo</Button>
              <Button variant="link" className="w-full text-sm" onClick={() => goToStep('bio')}>Skip for now</Button>
            </div>
          )}
          
          {/* Bio */}
          {step === 'bio' && (
            <div className="space-y-5">
              <textarea placeholder="Coffee addict ☕ Love meeting new people..." value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 120))}
                className="w-full h-24 px-4 py-3 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" autoFocus />
              <p className="text-2xs text-muted-foreground text-right">{bio.length}/120</p>
              <Button className="w-full h-12" onClick={() => goToStep('age')}>Continue</Button>
            </div>
          )}
          
          {/* Age */}
          {step === 'age' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {ageRanges.map((range) => (
                  <Button key={range} onClick={() => setAgeRange(range)}
                    variant={ageRange === range ? 'default' : 'secondary'}
                    className="py-3.5 px-4 h-auto"
                  >{range}</Button>
                ))}
              </div>
              <Button className="w-full h-12" onClick={() => ageRange && goToStep('interests')} disabled={!ageRange}>Continue</Button>
            </div>
          )}
          
          {/* Interests */}
          {step === 'interests' && (
            <div className="space-y-5">
              {/* Interest chips - 2 columns for larger tappable area */}
              <div className="grid grid-cols-2 gap-2.5">
                {interestOptions.map((item, idx) => {
                  const selected = interests.includes(item.id);
                  const isMaxed = interests.length >= 5 && !selected;
                  
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => !isMaxed && toggleInterest(item.id)}
                      disabled={isMaxed}
                      className={cn(
                        'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 tap-scale text-left',
                        selected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : isMaxed
                            ? 'border-border/20 bg-muted/30 opacity-50 cursor-not-allowed'
                            : 'border-border/30 bg-background/50 hover:border-border/50 hover:bg-background/80'
                      )}
                    >
                      {/* Category icon */}
                      <CategoryIcon category={item.id} size="sm" />
                      
                      {/* Label */}
                      <span className={cn(
                        'text-[13px] font-semibold flex-1',
                        selected ? 'text-primary' : 'text-foreground'
                      )}>
                        {item.label}
                      </span>
                      
                      {/* Checkmark for selected */}
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                          <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selection counter */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-300',
                      interests.length >= n ? 'bg-primary scale-100' : 'bg-muted-foreground/20 scale-75'
                    )}
                  />
                ))}
                <span className="text-[11px] text-muted-foreground ml-1.5">
                  {interests.length < 3 
                    ? `${3 - interests.length} more to go` 
                    : interests.length < 5 
                      ? `${interests.length} selected` 
                      : 'Max selected'}
                </span>
              </div>

              {/* Confirmation message when ready */}
              {interests.length >= 3 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20 animate-fade-in">
                  <span className="text-success">✓</span>
                  <p className="text-[11px] text-success font-medium">
                    Nice! We'll show you plans based on what you're into.
                  </p>
                </div>
              )}

              <Button 
                className="w-full h-12" 
                onClick={() => interests.length >= 3 && goToStep('zone')} 
                disabled={interests.length < 3}
              >
                Continue
              </Button>
            </div>
          )}
          
          {/* Zone */}
          {step === 'zone' && (
            <div className="space-y-4">
              {/* City selection */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Select your city</p>
                <div className="flex gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => { setSelectedCity(city.name); setZone(''); }}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 transition-all tap-scale',
                        selectedCity === city.name
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                          : 'border-border/30 bg-background/50 hover:border-border/50'
                      )}
                    >
                      <span className="text-2xl">{city.emoji}</span>
                      <span className={cn(
                        'text-[11px] font-semibold',
                        selectedCity === city.name ? 'text-primary' : 'text-foreground'
                      )}>{city.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone selection — show after city */}
              {selectedCity && (
                <div className="animate-fade-in">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    Where in {selectedCity}?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.find(c => c.name === selectedCity)?.zones.map((z) => (
                      <button
                        key={z}
                        onClick={() => setZone(z)}
                        className={cn(
                          'flex items-center gap-2 py-2.5 px-3 rounded-xl border transition-all tap-scale text-left',
                          zone === z
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/30 bg-background/50 hover:border-border/50'
                        )}
                      >
                        <span className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          zone === z ? 'bg-primary' : 'bg-muted-foreground/30'
                        )} />
                        <span className={cn(
                          'text-[12px] font-medium',
                          zone === z ? 'text-primary' : 'text-foreground'
                        )}>{z}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected summary */}
              {zone && (
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-success/10 border border-success/20 animate-scale-in">
                  <span className="text-success text-sm">📍</span>
                  <span className="text-[12px] font-semibold text-success">{zone}, {selectedCity}</span>
                </div>
              )}

              <Button className="w-full h-12" onClick={handleComplete} disabled={!zone || interests.length < 3}>Let's Go</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}