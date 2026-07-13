import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import FloatingShapes from "./FloatingShapes";

const Agenda = () => {
  return (
    <section
      id="agenda"
      className="relative overflow-hidden py-28 bg-gradient-to-b from-background via-background to-muted/30"
    >
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-16 -left-10 w-44 md:w-64", opacity: 0.12, anim: "floaty" },
          { shape: "hex", className: "bottom-16 right-10 w-28 md:w-40", opacity: 0.14, anim: "floaty-rev" },
        ]}
      />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <CalendarClock className="h-3.5 w-3.5" />
            Agenda
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Próximamente
          </h2>

          <p className="mt-5 text-2xl md:text-[1.625rem] leading-relaxed text-muted-foreground">
            Estamos finalizando los detalles de la programación oficial.
            La agenda completa, con ponentes, salas y horarios, estará
            disponible muy pronto.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Agenda;
