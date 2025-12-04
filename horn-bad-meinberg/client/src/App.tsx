import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TenantProvider } from "./contexts/TenantContext";
import Home from "./pages/Home";
import News from "./pages/News";
import Events from "./pages/Events";
import Departments from "./pages/Departments";
import IssueReports from "./pages/IssueReports";
import Waste from "./pages/Waste";
import Alerts from "./pages/Alerts";
import Tourism from "./pages/Tourism";
import Education from "./pages/Education";
import Business from "./pages/Business";
import Clubs from "./pages/Clubs";
import Council from "./pages/Council";
import Services from "./pages/Services";
import ServiceTermine from "./pages/ServiceTermine";
import ServiceMeldebescheinigung from "./pages/ServiceMeldebescheinigung";
import ServiceHundesteuer from "./pages/ServiceHundesteuer";
import ServiceFuehrungszeugnis from "./pages/ServiceFuehrungszeugnis";
import ServiceBauen from "./pages/ServiceBauen";
import ServiceGewerbe from "./pages/ServiceGewerbe";
import Contact from "./pages/Contact";
import AdminContact from "./pages/AdminContact";
import AdminNotifications from "./pages/AdminNotifications";
import AdminRequests from "./pages/AdminRequests";
import Notifications from "./pages/Notifications";
import NeighborhoodHelp from "./pages/NeighborhoodHelp";
import CreateHelpRequest from "./pages/CreateHelpRequest";
import CreateHelpOffer from "./pages/CreateHelpOffer";
import NeighborhoodHelpChat from "./pages/NeighborhoodHelpChat";
import TestHash from "./pages/TestHash";

import { useNotificationListener } from "./hooks/useNotificationListener";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/news"} component={News} />
      <Route path={"/events"} component={Events} />
      <Route path={"/departments"} component={Departments} />
      <Route path={"/services"} component={Services} />
      <Route path={"/service/termine"} component={ServiceTermine} />
      <Route path={"/service/meldebescheinigung"} component={ServiceMeldebescheinigung} />
      <Route path={"/service/hundesteuer"} component={ServiceHundesteuer} />
      <Route path={"/service/fuehrungszeugnis"} component={ServiceFuehrungszeugnis} />
      <Route path={"/service/bauen"} component={ServiceBauen} />
      <Route path={"/service/gewerbe"} component={ServiceGewerbe} />
      <Route path={"/issues"} component={IssueReports} />
      <Route path={"/waste"} component={Waste} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/tourism"} component={Tourism} />
      <Route path={"/education"} component={Education} />
      <Route path={"/business"} component={Business} />
      <Route path={"/clubs"} component={Clubs} />
      <Route path={"/council"} component={Council} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/admin/contact"} component={AdminContact} />
      <Route path={"/admin/notifications"} component={AdminNotifications} />
      <Route path={"/admin/requests"} component={AdminRequests} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/neighborhood-help"} component={NeighborhoodHelp} />
      <Route path={"/neighborhood-help/request"} component={CreateHelpRequest} />
      <Route path={"/neighborhood-help/offer"} component={CreateHelpOffer} />
      <Route path={"/neighborhood-help/chat"} component={NeighborhoodHelpChat} />
      <Route path={"/test-hash"} component={TestHash} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
  );
}

function App() {
  // Listen for service worker notification messages
  useNotificationListener();
  
  return (
    <ErrorBoundary>
      <TenantProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TenantProvider>
    </ErrorBoundary>
  );
}

export default App;

