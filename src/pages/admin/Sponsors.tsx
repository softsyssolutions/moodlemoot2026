import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortalManager from "./PortalManager";
import SponsorsLegacy from "./SponsorsLegacy";

export default function AdminSponsors() {
  const [tab, setTab] = useState("aprobados");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sponsors</h1>
        <p className="text-sm text-muted-foreground">
          Aprueba sponsors y trabaja con ellos para que completen sus datos. Los aprobados se publican en la web.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="aprobados">Aprobados</TabsTrigger>
          <TabsTrigger value="publicados">Publicados en la web</TabsTrigger>
        </TabsList>
        <TabsContent value="aprobados" className="mt-5"><PortalManager entity="sponsor" /></TabsContent>
        <TabsContent value="publicados" className="mt-5"><SponsorsLegacy /></TabsContent>
      </Tabs>
    </div>
  );
}
