import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Shield, Users, Brain, Stethoscope, FileText } from "lucide-react";
import logoImage from "@assets/logo_1765394780707.png";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="DoctorPath AI" className="h-10 w-auto" />
            <span className="text-xl font-bold text-foreground">DoctorPath AI</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/login">
              <Button variant="ghost" data-testid="link-login">Login</Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="link-signup">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-50 to-white dark:from-medical-blue-900/20 dark:to-background" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                AI-Powered
                <span className="text-medical-blue-600 block">Oncology Support</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                DoctorPath AI empowers new oncologists with intelligent diagnostic tools, 
                treatment recommendations, and knowledge graph visualization to deliver 
                better patient care.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8" data-testid="button-learn-more">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Oncologists</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">10K+</p>
                  <p className="text-sm text-muted-foreground">Patients Helped</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-400 to-medical-blue-600 rounded-3xl transform rotate-3 opacity-20" />
                <div className="relative bg-gradient-to-br from-medical-blue-500 to-medical-blue-700 rounded-3xl p-8 text-white">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">AI Diagnosis Assistant</p>
                        <p className="text-sm text-medical-blue-100">Powered by MedGemma</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Cancer Risk Assessment</span>
                        <span className="text-medical-green-200">Complete</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-medical-green-500 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-xs text-medical-blue-100">Cancer Types</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">24/7</p>
                        <p className="text-xs text-medical-blue-100">AI Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Oncology Support
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything new oncologists need to provide exceptional patient care
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-medical-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AI Diagnosis Tool</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Calculate cancer risk probabilities for liver, lung, and breast cancer 
                  based on biomarkers and clinical data.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-medical-green-100 dark:bg-medical-green-900/30 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-medical-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Patient Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track patient appointments, test results, medical history, and 
                  treatment progress all in one place.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Knowledge Graph</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize treatment paths and medical relationships to make 
                  informed clinical decisions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Doctor-Patient Portal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Secure communication channel between doctors and patients with 
                  data sharing capabilities.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-medical-red-100 dark:bg-medical-red-900/30 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-medical-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Real-time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor patient progress and treatment outcomes with 
                  comprehensive analytics dashboards.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-medical-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">HIPAA Compliant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade security ensuring all patient data is 
                  protected and compliant with regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-medical-blue-600 to-medical-blue-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-medical-blue-100 mb-8">
            Join hundreds of oncologists already using DoctorPath AI to 
            improve patient outcomes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8" data-testid="button-cta-signup">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 text-white border-white/30 hover:bg-white/10" data-testid="button-cta-login">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="DoctorPath AI" className="h-8 w-auto" />
              <span className="font-semibold text-foreground">DoctorPath AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 DoctorPath AI. Final Year Project - FAST NUCES.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
