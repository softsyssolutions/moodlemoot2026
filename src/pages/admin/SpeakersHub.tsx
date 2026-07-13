import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortalManager from "./PortalManager";
import SpeakerProposals from "./SpeakerProposals";

export default function SpeakersHub() {
  const [tab, setTab] = useState("aprobados");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Speakers</h1>
        <p className="text-sm text-muted-foreground">
          Aprueba postulaciones y trabaja con los aprobados para que completen sus datos.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="aprobados">Aprobados</TabsTrigger>
          <TabsTrigger value="postulaciones">Postulaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="aprobados" className="mt-5"><PortalManager entity="speaker" /></TabsContent>
        <TabsContent value="postulaciones" className="mt-5"><SpeakerProposals /></TabsContent>
      </Tabs>
    </div>
  );
}
