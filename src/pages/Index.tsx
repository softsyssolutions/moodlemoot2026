import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Invitation from "@/components/landing/Invitation";
import Marquee from "@/components/landing/Marquee";
import Organizers from "@/components/landing/Organizers";
import About from "@/components/landing/About";
import Axes from "@/components/landing/Axes";
import Speakers from "@/components/landing/Speakers";
import Agenda from "@/components/landing/Agenda";
import Sponsors from "@/components/landing/Sponsors";
import Benefits from "@/components/landing/Benefits";
import Venue from "@/components/landing/Venue";
import LatestNews from "@/components/landing/LatestNews";
import Notify from "@/components/landing/Notify";
import Footer from "@/components/landing/Footer";
import EventChatbot from "@/components/landing/EventChatbot";

const eventLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "MoodleMoot Perú 2026",
  startDate: "2026-09-18T09:00:00-05:00",
  endDate: "2026-09-19T18:00:00-05:00",
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: [
    {
      "@type": "Place",
      name: "Universidad Marcelino Champagnat",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Mariscal Castilla 1270",
        addressLocality: "Santiago de Surco",
        addressRegion: "Lima",
        addressCountry: "PE",
      },
    },
    {
      "@type": "VirtualLocation",
      url: "https://moodlemootperu.com/",
    },
  ],
  image: ["https://moodlemootperu.com/moodlemoot-logo-2026.png"],
  description:
    "MoodleMoot Perú 2026 · El encuentro Moodle más grande del Perú. Dos días con educadores, desarrolladores y líderes EdTech.",
  organizer: {
    "@type": "Organization",
    name: "MoodleMoot Perú",
    url: "https://moodlemootperu.com/",
  },
  url: "https://moodlemootperu.com/",
};

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    const params = new URLSearchParams(location.search);
    const cta = params.get("cta");
    if (!hash && !cta) return;

    const scrollTarget = hash || (cta === "sponsor" ? "sponsors" : "");
    const t1 = window.setTimeout(() => {
      if (scrollTarget) {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth" });
      }
      if (cta === "sponsor") {
        window.setTimeout(() => {
          window.dispatchEvent(new Event("open-sponsor-proposal"));
        }, 600);
      }
    }, 200);
    return () => window.clearTimeout(t1);
  }, [location.hash, location.search]);

  return (
  <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
    <Helmet>
      <link rel="canonical" href="https://moodlemootperu.com/" />
      <meta property="og:url" content="https://moodlemootperu.com/" />
      <script type="application/ld+json">{JSON.stringify(eventLd)}</script>
    </Helmet>
    <Navbar />
    <Hero />
    <Invitation />
    <Marquee />
    <Organizers />
    <About />
    <Axes />
    <Speakers />
    <Agenda />
    <Sponsors />
    <Benefits />
    <Venue />
    <LatestNews />
    <Notify />
    <Footer />
    <EventChatbot />
  </div>
  );
};

export default Index;
