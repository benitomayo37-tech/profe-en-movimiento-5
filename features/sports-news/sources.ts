import type {
  SportsNewsCategory,
} from "@/features/sports-news/types";

export interface SportsNewsSource {
  id: string;
  name: string;
  feedUrl: string;
  category: SportsNewsCategory;
  allowedDomains: string[];
}

export const sportsNewsSources:
  SportsNewsSource[] = [
  {
    id: "el-universo-ligapro",
    name: "El Universo",
    feedUrl:
      "https://www.eluniverso.com/arc/outboundfeeds/rss-subsection/deportes/campeonato-ecuatoriano?outputType=xml",
    category: "ecuadorian-football",
    allowedDomains: ["eluniverso.com"],
  },  {
    id: "as-football",
    name: "AS",
    feedUrl:
      "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/futbol/portada/",
    category: "football",
    allowedDomains: ["as.com"],
  },
  {
    id: "as-nba",
    name: "AS",
    feedUrl:
      "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/baloncesto/subsection/nba/",
    category: "nba",
    allowedDomains: ["as.com"],
  },  {
    id: "as-tennis",
    name: "AS",
    feedUrl:
      "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/tenis/portada/",
    category: "tennis",
    allowedDomains: ["as.com"],
  },
  {
    id: "as-athletics",
    name: "AS",
    feedUrl:
      "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/masdeporte/subsection/atletismo/",
    category: "athletics",
    allowedDomains: ["as.com"],
  },
  {
    id: "as-multisport",
    name: "AS",
    feedUrl:
      "https://feeds.as.com/mrss-s/pages/as/site/as.com/section/masdeporte/subsection/polideportivo/",
    category: "multisport",
    allowedDomains: ["as.com"],
  },
  {
    id: "marca-nba",
    name: "MARCA",
    feedUrl:
      "https://e00-us-marca.uecdn.es/rss/nba.xml",
    category: "nba",
    allowedDomains: ["marca.com"],
  },
  {
    id: "marca-mlb",
    name: "MARCA",
    feedUrl:
      "https://e00-us-marca.uecdn.es/rss/mlb.xml",
    category: "mlb",
    allowedDomains: ["marca.com"],
  },
  {
    id: "marca-ufc",
    name: "MARCA",
    feedUrl:
      "https://e00-us-marca.uecdn.es/rss/ufc.xml",
    category: "mma",
    allowedDomains: ["marca.com"],
  },
];