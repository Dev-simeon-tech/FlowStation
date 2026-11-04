import { useEffect } from "react";
import FlowStationLanding from "@/components/flowstation-landing";

export default function Home() {
  useEffect(() => {
    document.title = "FlowStation | Station operations made clear";
  }, []);

  return <FlowStationLanding />;
}
