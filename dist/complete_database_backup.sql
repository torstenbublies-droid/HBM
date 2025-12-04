--
-- PostgreSQL database dump
--

\restrict bGM0D9z4h67n0v1R1jcCfhWI1lHgt93aO2EawTqsJTAAX7td50elLH0n4ayk8ne

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attractions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attractions (
    id integer NOT NULL,
    tenant_id character varying(255) NOT NULL,
    name character varying(500) NOT NULL,
    description text,
    category character varying(255),
    image_url text,
    address text,
    more_info_url text,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    main_category character varying(100)
);


--
-- Name: attractions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attractions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attractions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attractions_id_seq OWNED BY public.attractions.id;


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clubs (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    address character varying(500),
    phone character varying(50),
    fax character varying(50),
    email character varying(255),
    website character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: clubs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clubs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clubs_id_seq OWNED BY public.clubs.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(100),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE departments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.departments IS 'Stores department information for each tenant';


--
-- Name: COLUMN departments.icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.departments.icon IS 'Icon name for the department (e.g., "Building", "Users", "Briefcase")';


--
-- Name: COLUMN departments.display_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.departments.display_order IS 'Order in which departments should be displayed';


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: education_facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.education_facilities (
    id integer NOT NULL,
    tenant_id character varying(255) NOT NULL,
    category_id integer,
    name character varying(255) NOT NULL,
    address character varying(500),
    phone character varying(100),
    fax character varying(100),
    email character varying(255),
    website character varying(500),
    opening_hours text,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: education_facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.education_facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: education_facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.education_facilities_id_seq OWNED BY public.education_facilities.id;


--
-- Name: education_institutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.education_institutions (
    id integer NOT NULL,
    tenant_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    description text,
    address text,
    phone character varying(50),
    fax character varying(50),
    email character varying(255),
    website character varying(500),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: education_institutions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.education_institutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: education_institutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.education_institutions_id_seq OWNED BY public.education_institutions.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    department_id integer,
    name character varying(255) NOT NULL,
    title character varying(255),
    responsibilities text,
    phone character varying(50),
    fax character varying(50),
    email character varying(255),
    room character varying(50),
    address character varying(500),
    office_hours text,
    source_url text,
    scraped_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE employees; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.employees IS 'Stores employee contact information organized by department';


--
-- Name: COLUMN employees.responsibilities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employees.responsibilities IS 'Description of employee responsibilities and tasks';


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    location character varying(255),
    image_url text,
    source_url text NOT NULL,
    category character varying(100),
    scraped_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.events IS 'Stores event data scraped from tenant websites';


--
-- Name: COLUMN events.tenant_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.tenant_id IS 'Reference to the tenant this event belongs to';


--
-- Name: COLUMN events.start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.start_date IS 'Event start date and time';


--
-- Name: COLUMN events.end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.end_date IS 'Event end date and time (optional for single-day events)';


--
-- Name: COLUMN events.source_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.source_url IS 'Original URL of the event (used for deduplication)';


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: help_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help_conversations (
    id text NOT NULL,
    tenant_id text NOT NULL,
    request_id text,
    offer_id text,
    requester_id text NOT NULL,
    requester_name text NOT NULL,
    helper_id text NOT NULL,
    helper_name text NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contact_shared boolean DEFAULT false
);


--
-- Name: help_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help_messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    sender_id text NOT NULL,
    sender_name text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: help_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help_offers (
    id text NOT NULL,
    tenant_id text NOT NULL,
    created_by text NOT NULL,
    created_by_name text NOT NULL,
    categories text[] NOT NULL,
    description text NOT NULL,
    district text NOT NULL,
    radius integer DEFAULT 5,
    availability text,
    contact_method text NOT NULL,
    phone_number text,
    status text DEFAULT 'open'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: help_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help_requests (
    id text NOT NULL,
    tenant_id text NOT NULL,
    created_by text NOT NULL,
    created_by_name text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    district text NOT NULL,
    meeting_point text,
    timeframe text,
    urgency text DEFAULT 'medium'::text,
    contact_method text NOT NULL,
    phone_number text,
    status text DEFAULT 'open'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id character varying(64) NOT NULL,
    "tenantId" character varying(64) NOT NULL,
    title character varying(500) NOT NULL,
    teaser text,
    "bodyMD" text,
    "imageUrl" character varying(1000),
    category character varying(100),
    "publishedAt" timestamp without time zone NOT NULL,
    "sourceUrl" character varying(1000),
    "createdAt" timestamp without time zone DEFAULT now()
);


--
-- Name: pois; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pois (
    id character varying(64) NOT NULL,
    "tenantId" character varying(64) NOT NULL,
    name character varying(500) NOT NULL,
    description text,
    category character varying(100),
    latitude character varying(50),
    longitude character varying(50),
    address character varying(500),
    "imageUrl" character varying(1000),
    "websiteUrl" character varying(1000),
    "openingHours" text,
    pricing text,
    "createdAt" timestamp without time zone DEFAULT now()
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id character varying(64) NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(100) NOT NULL,
    domain character varying(255),
    "primaryColor" character varying(20) DEFAULT '#0066CC'::character varying,
    "secondaryColor" character varying(20) DEFAULT '#00A86B'::character varying,
    "logoUrl" character varying(1000),
    "heroImageUrl" character varying(1000),
    "contactEmail" character varying(320),
    "contactPhone" character varying(50),
    "contactAddress" text,
    "weatherLat" character varying(50),
    "weatherLon" character varying(50),
    "weatherCity" character varying(200),
    "chatbotName" character varying(100) DEFAULT 'Chatbot'::character varying,
    "chatbotSystemPrompt" text,
    "enabledFeatures" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    mayor_name character varying(200),
    mayor_email character varying(320),
    mayor_phone character varying(50),
    mayor_address text,
    mayor_office_hours text,
    "imprintUrl" character varying(1000),
    "privacyUrl" character varying(1000)
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(64) NOT NULL,
    "tenantId" character varying(64),
    name text,
    email character varying(320),
    "loginMethod" character varying(64),
    role public.role DEFAULT 'user'::public.role NOT NULL,
    "oneSignalPlayerId" character varying(64),
    "pushEnabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    "lastSignedIn" timestamp without time zone DEFAULT now()
);


--
-- Name: waste_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waste_areas (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE waste_areas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.waste_areas IS 'Stores waste collection areas (streets/districts) for each tenant';


--
-- Name: waste_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.waste_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: waste_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.waste_areas_id_seq OWNED BY public.waste_areas.id;


--
-- Name: waste_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waste_collections (
    id integer NOT NULL,
    tenant_id character varying(64) NOT NULL,
    area_id integer NOT NULL,
    waste_type_id integer NOT NULL,
    collection_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE waste_collections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.waste_collections IS 'Stores waste collection schedule for each area';


--
-- Name: waste_collections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.waste_collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: waste_collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.waste_collections_id_seq OWNED BY public.waste_collections.id;


--
-- Name: waste_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waste_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(50) NOT NULL,
    icon character varying(50),
    description text
);


--
-- Name: TABLE waste_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.waste_types IS 'Stores types of waste bins (Bio, Restmüll, Papier, Gelbe Tonne)';


--
-- Name: waste_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.waste_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: waste_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.waste_types_id_seq OWNED BY public.waste_types.id;


--
-- Name: attractions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attractions ALTER COLUMN id SET DEFAULT nextval('public.attractions_id_seq'::regclass);


--
-- Name: clubs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs ALTER COLUMN id SET DEFAULT nextval('public.clubs_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: education_facilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_facilities ALTER COLUMN id SET DEFAULT nextval('public.education_facilities_id_seq'::regclass);


--
-- Name: education_institutions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_institutions ALTER COLUMN id SET DEFAULT nextval('public.education_institutions_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: waste_areas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_areas ALTER COLUMN id SET DEFAULT nextval('public.waste_areas_id_seq'::regclass);


--
-- Name: waste_collections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections ALTER COLUMN id SET DEFAULT nextval('public.waste_collections_id_seq'::regclass);


--
-- Name: waste_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_types ALTER COLUMN id SET DEFAULT nextval('public.waste_types_id_seq'::regclass);


--
-- Data for Name: attractions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attractions (id, tenant_id, name, description, category, image_url, address, more_info_url, display_order, created_at, updated_at, main_category) FROM stdin;
26	tenant_hornbadmeinberg_001	Externsteine	Die eindrucksvolle Felsformation gehört zu den bemerkenswertesten Natur- und Kulturdenkmälern Mitteleuropas. Es ranken sich zahllose Geschichten und Mythen um die ca. 80 Millionen Jahre alte Sandsteingruppe. Die Felsen können über zwei in den Stein gearbeitete Treppenaufgänge erklommen werden. Ein Aufstieg, der sich lohnt! Denn aus ca. 40 m Höhe bietet sich den Besuchern ein beeindruckender Ausblick in die abwechslungsreiche Landschaft des Teutoburger Waldes.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/1-externsteine.jpg		https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	0	2025-12-02 08:22:40.034946	2025-12-02 08:22:40.034946	Sehenswürdigkeiten in Horn-Bad Meinberg
27	tenant_hornbadmeinberg_001	Vogeltaufe	Der südöstlich auslaufende Bergrücken des Stembergs wird „Vogeltaufe" genannt, nach einer Sage. Der Sage nach wollte hier Abt Anastasius die Heiden des Lipperlandes taufen. Gerade in dem Moment, als Abbio von Thiotmalli den Göttern Donar, Saxnot und Wotan entsagte, rauschte es in der Luft und Hunderte von kleinen braunen Vögeln ließen sich hernieder und sangen so schön, wie es nie zuvor jemand gehört hatte.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/2-vogeltaufe.jpg	Vogeltaufenweg, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	1	2025-12-02 08:22:40.036663	2025-12-02 08:22:40.036663	Sehenswürdigkeiten in Horn-Bad Meinberg
41	tenant_hornbadmeinberg_001	Hermannsdenkmal	Mit einer Höhe von 60 m ist das Wahrzeichen des Teutoburger Waldes bereits aus der Ferne sichtbar. Das Hermannsdenkmal erinnert an Arminius (Hermann), einen Fürsten der Cherusker, der die Germanen in der Varusschlacht im Jahre 9 n. Chr. zum Sieg über die römischen Legionen führte.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-100.jpg	Grotenburg 50, 32760 Detmold	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	100	2025-12-02 08:41:42.33905	2025-12-02 08:41:42.33905	Sehenswürdigkeiten in der Umgebung
42	tenant_hornbadmeinberg_001	LWL-Freilichtmuseum Detmold	Das weitläufige Gelände mit historischen Gebäuden ist umgeben von herrlicher Natur. In den Werkstätten schauen Sie der Fotografin, dem Schmied, dem Bäcker und der Töpferin bei der Arbeit zu. Auf den Weiden findet man alte und zum Teil vom Aussterben bedrohte Haustierrassen wie die Senner Pferde oder das Siegerländer Rotvieh.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-101.jpg	Krummes Haus, 32760 Detmold	https://www.lwl-freilichtmuseum-detmold.de/	101	2025-12-02 08:41:42.763465	2025-12-02 08:41:42.763465	Sehenswürdigkeiten in der Umgebung
43	tenant_hornbadmeinberg_001	Falkenburg	Die Falkenburg ist ehemaliger Sitz der Herrschaft zur Lippe, erbaut ca. 1194 von Bernhard II. zur Lippe. Die Ruine dieser mittelalterlichen Höhenburg mit Ringmauer, Bergfried, Palas, Vorburg und Zwinger ist auf eigene Faust und im Rahmen von Führungen erlebbar.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-102.jpg	Falkenburg, 32760 Detmold	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	102	2025-12-02 08:41:43.187257	2025-12-02 08:41:43.187257	Sehenswürdigkeiten in der Umgebung
44	tenant_hornbadmeinberg_001	Adlerwarte Berlebeck	Die Adlerwarte beherbergt mehr als 200 Greifvögel aus aller Welt: Weißkopfseeadler, Lanner- und Sakerfalken, Mönchs- und Gänsegeier, heimische Milane und Bussarde. Auf der Panoramaterrasse mit Blick in den Teutoburger Wald finden regelmäßig Freiflugshows statt.	Natur & Tiere	/assets/hornbadmeinberg/attractions/umgebung-103.jpg	Hangsteinstraße 4, 32760 Detmold-Berlebeck	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	103	2025-12-02 08:41:43.502867	2025-12-02 08:41:43.502867	Sehenswürdigkeiten in der Umgebung
45	tenant_hornbadmeinberg_001	Vogelpark Heiligenkirchen	Ein privat geführter Vogelpark der besonderen Art mit über 1.200 Vögeln und 300 Arten Säugetiere. Pelikane, Störche, Kraniche, Pfauen und seltene Hornvögel, Affen, Präriehunde und Kängurus können hier bestaunt werden. Mit Streichelwiese und Abenteuerspielplatz.	Natur & Tiere	/assets/hornbadmeinberg/attractions/umgebung-104.jpg	Ostertalstraße 1, 32760 Detmold-Heiligenkirchen	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	104	2025-12-02 08:41:43.918933	2025-12-02 08:41:43.918933	Sehenswürdigkeiten in der Umgebung
46	tenant_hornbadmeinberg_001	Schloss Detmold	Ein Schloss im Stil der Weserrenaissance, bewohnt von der Familie von Dr. Armin Prinz zur Lippe. Teile des Schlosses stehen Besuchern offen mit umfangreichen Sammlungen an Porzellanen, historischen Waffen und Gemälden.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-105.jpg	Schlossplatz 1, 32756 Detmold	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	105	2025-12-02 08:41:44.355818	2025-12-02 08:41:44.355818	Sehenswürdigkeiten in der Umgebung
28	tenant_hornbadmeinberg_001	Lavendelfeld Fromhausen	Bereits seit 2014 werden in dem schönen Lipperland (Fromhausen) erfolgreich Lavendelfelder angelegt. Das lila Blütenmeer begeistert seit Jahren Alt und Jung und ist mittlerweile zu einem magischen Anziehungsort für Menschen aus aller Welt geworden. Jedes Jahr im Sommer, vor allem kurz vor Sonnenuntergang erlebt man einmalige, magische Augenblicke begleitet von duftend-blumigen Feldern.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/3-lavendelfeld-fromhausen.jpg		https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	2	2025-12-02 08:22:40.037523	2025-12-02 08:22:40.037523	Sehenswürdigkeiten in Horn-Bad Meinberg
29	tenant_hornbadmeinberg_001	Historischer Kurpark Bad Meinberg	Der 6,25 ha große historische Kurpark eines der ältesten Mineral- und Moorheilbäder Deutschlands, wurde im Spätbarock ab 1767 angelegt und immer wieder den Erfordernissen eines modernen Kurbetriebs angepasst und erweitert. Von dem Landschaftsgarten des 19. Jahrhunderts sind bis heute ein großer Teil des alten Baumbestandes und ein Schneckenberg erhalten.	Parks & Gärten	/assets/hornbadmeinberg/attractions/4-historischer-kurpark-bad-meinberg.jpg	Parkstraße 10, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	3	2025-12-02 08:22:40.038273	2025-12-02 08:22:40.038273	Sehenswürdigkeiten in Horn-Bad Meinberg
30	tenant_hornbadmeinberg_001	Seekurpark Bad Meinberg	Von 1952 bis 1955 wurde nach Plänen von Hermann Niemeyer der Kurpark am See angelegt. Hier erwartet den Gast in den Monaten Mai bis Oktober von 9:00 bis 11:00 und 15:00 bis 17:00 Uhr eine 12 Meter hohe Fontäne.	Parks & Gärten	/assets/hornbadmeinberg/attractions/5-seekurpark-bad-meinberg.jpg	32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	4	2025-12-02 08:22:40.038886	2025-12-02 08:22:40.038886	Sehenswürdigkeiten in Horn-Bad Meinberg
31	tenant_hornbadmeinberg_001	Silvaticum - Länderwaldpark	Ende der fünfziger Jahre wurde in Bad Meinberg ein ganz neuartiger Kurpark geschaffen, ein Länderwaldpark, geordnet nach unterschiedlichen Landschaften der Erde. 36.000 Bäume und Sträucher auf einer Fläche von ca. 12 ha. Dreizehn je ca. 1 ha große Waldlandschaften aus Mittel- und Südeuropa, Nordamerika und Ostasien. Die Wege des Silvaticums werden gern für erholsame Spaziergänge und Wanderungen genutzt.	Parks & Gärten	/assets/hornbadmeinberg/attractions/6-silvaticum-l-nderwaldpark.jpg	Wällenweg, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	5	2025-12-02 08:22:40.039554	2025-12-02 08:22:40.039554	Sehenswürdigkeiten in Horn-Bad Meinberg
32	tenant_hornbadmeinberg_001	Kurpark Holzhausen-Externsteine	Der Kurpark im Luftkurort Holzhausen-Externsteinen bietet vielfältige Möglichkeiten für Begegnungen, Sport und Entspannung. Mit einer Boulderwand, einem inklusiven Bodentrampolin und einem Balancierparcours fördert der Park die sportliche Betätigung von Jung und Alt. Umgeben von einer reichen Baum- und Pflanzenvielfalt, darunter beeindruckende Mammutbäume und Ginkgos.	Parks & Gärten	/assets/hornbadmeinberg/attractions/7-kurpark-holzhausen-externsteine.jpg	Golfweg, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	6	2025-12-02 08:22:40.040226	2025-12-02 08:22:40.040226	Sehenswürdigkeiten in Horn-Bad Meinberg
33	tenant_hornbadmeinberg_001	Burg Horn	Das bedeutende Baudenkmal der Landesgeschichte mit umliegendem Burghof-Ensemble beherbergt ein Museum mit Dauerausstellung und wechselnden Exponaten. Hier wird die Burg- und Stadtgeschichte von Horn lebendig. Öffnungszeiten (Ostern bis Allerheiligen): Fr., Sa., So. 14:00 - 17:00 Uhr. Der Eintritt ist frei.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/8-burg-horn.jpg	32805 Horn-Bad Meinberg	http://www.burgmuseum-horn.de/	7	2025-12-02 08:22:40.041077	2025-12-02 08:22:40.041077	Sehenswürdigkeiten in Horn-Bad Meinberg
34	tenant_hornbadmeinberg_001	Historischer Stadtkern Horn	Horn gilt als Gründungsstadt der Edelherren zur Lippe und taucht urkundlich erstmals 1248 auf. Im Stadtkern befinden sich neben der Burg Horn mit dem dazugehörigen Burgmuseum zahlreiche historische Fachwerkgebäude und das imposante neugotische Rathaus. Der 1,6 km lange Wallrundgang bietet die Möglichkeit die historische Altstadt von Horn zu umrunden und dabei interessante Winkel der Stadt zu entdecken.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/9-historischer-stadtkern-horn.jpg	Mittelstraße, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	8	2025-12-02 08:22:40.041933	2025-12-02 08:22:40.041933	Sehenswürdigkeiten in Horn-Bad Meinberg
35	tenant_hornbadmeinberg_001	Rathaus Horn	Das Rathaus in Horn, das auf dem Marktplatz thront, besticht durch seine markante neugotische Bauweise. Der Baumeister und Architekt Wilhelm Lakemeier aus Steinheim (Westfalen) errichtete zwischen 1865 und 1866 das heutige Rathaus als Ersatz für das beim großen Stadtbrand von 1864 zerstörte Vorgängergebäude. Besonders markant ist die zum Marktplatz gerichtete Schaufront und der viergeschossige, achteckige Eckturm.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/10-rathaus-horn.jpg	Marktplatz 4, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	9	2025-12-02 08:22:40.042581	2025-12-02 08:22:40.042581	Sehenswürdigkeiten in Horn-Bad Meinberg
36	tenant_hornbadmeinberg_001	Brunnentempel	Der Brunnentempel ist das Wahrzeichen von Bad Meinberg und eines der beliebtesten Fotomotive im Historischen Kurpark. Er wurde 1842 errichtet und gilt seitdem als besonderes Augenmerk des Historischen Kurparks. Im Inneren ist die Bad Meinberger Heilquelle in Natura zu bestaunen.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/11-brunnentempel.jpg	Parkstraße 10, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	10	2025-12-02 08:22:40.043359	2025-12-02 08:22:40.043359	Sehenswürdigkeiten in Horn-Bad Meinberg
37	tenant_hornbadmeinberg_001	Lippischer Velmerstot	Der Velmerstot ist der höchste Berg des Eggegebirges. Der Berg besitzt zwei Bergkuppen: Der Lippische Velmerstot (ca. 440 m) und der Preußische Velmerstot (ca. 460 m). Auf der höchsten Anhöhe befindet sich der Eggeturm, eine Holzkonstruktion mit Aussichtsplattform, von der aus Sie einen 360°-Panoramablick in die sanften Hügel der Umgebung genießen können.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/12-lippischer-velmerstot.jpg	Wanderparkplatz Silbergrund 62, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	11	2025-12-02 08:22:40.048149	2025-12-02 08:22:40.048149	Sehenswürdigkeiten in Horn-Bad Meinberg
38	tenant_hornbadmeinberg_001	Norderteich	Von vielen Einheimischen wird das Natur- und Vogelschutzgebiet rund um den Norderteich auch das „Lippische Meer" genannt und lockt jedes Jahr zahlreiche Wanderer und Ausflügler an. Erstmals 1115 urkundlich im Güterverzeichnis des Corveyer Abtes Erkenbert erwähnt, ist es das älteste Naturschutzgebiet Lippes. Mönche legen einst den zwölf Hektar großen Teich an, um Fische zu züchten.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/13-norderteich.jpg	Steinheimer Str. 201, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	12	2025-12-02 08:22:40.048851	2025-12-02 08:22:40.048851	Sehenswürdigkeiten in Horn-Bad Meinberg
39	tenant_hornbadmeinberg_001	Silberbachtal	Im Silberbachtal nahe der Ortschaft Leopoldstal wird zwischen 1710 und 1711 nach Silber gesucht. Die Wasserkraft des silbrig schimmernden Silberbaches führte jedoch zu einer Ansiedlung verschiedener Mühlenbetriebe. Das wild-romantische Silberbachtal ist der ideale Ausgangspunkt für ausgiebige Wanderungen, etwa zur Velmerstot mit seinen Zwillingsgipfeln.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/14-silberbachtal.jpg	Parkplatz Silberbachtal, 32805 Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html	13	2025-12-02 08:22:40.049412	2025-12-02 08:22:40.049412	Sehenswürdigkeiten in Horn-Bad Meinberg
40	tenant_hornbadmeinberg_001	Freilichtbühne Bellenberg	Die Freilichtbühne Bellenberg liegt direkt am Waldrand und bietet mit rund 850 Sitzplätzen Theaterspaß für Groß und Klein. Sie blickt auf eine 70-jährige Tradition zurück. Die Bühnenanlage gleicht einem Amphitheater - Bühnenfläche und Zuschauerbänke bilden einen Kreis. Ein Teilbereich ist sogar überdacht.	Kultur & Freizeit	/assets/hornbadmeinberg/attractions/15-freilichtb-hne-bellenberg.jpg	32805 Horn-Bad Meinberg	https://freilichtbuehne-bellenberg.reservix.de/events	14	2025-12-02 08:22:40.050069	2025-12-02 08:22:40.050069	Sehenswürdigkeiten in Horn-Bad Meinberg
48	tenant_hornbadmeinberg_001	Köterberg	496m ist er hoch und somit die höchste Erhebung im Lipper Bergland. Ein Freilichtkino bietet einen atemberaubenden Panoramablick auf den Teutoburger Wald und das Weserbergland. 36 Holz-Kinoplätze laden ein, den wunderbaren „Naturfilm" zu genießen.	Natur & Landschaft	/assets/hornbadmeinberg/attractions/umgebung-107.jpg	Köterberg, Lügde	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	107	2025-12-02 08:41:45.097923	2025-12-02 08:41:45.097923	Sehenswürdigkeiten in der Umgebung
49	tenant_hornbadmeinberg_001	Lippisches Landesmuseum Detmold	Das größte und älteste Regionalmuseum Ostwestfalen-Lippes. Gegründet 1835 als Naturhistorisches Museum, präsentiert es heute eine großartige Sammlung lippischer und außerlippischer Kulturgüter.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-108.jpg	Ameide 4, 32756 Detmold	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	108	2025-12-02 08:41:45.516831	2025-12-02 08:41:45.516831	Sehenswürdigkeiten in der Umgebung
50	tenant_hornbadmeinberg_001	Landestheater Detmold	Das Landestheater wurde 1919 eröffnet und bietet heute 648 Plätze. Es ist das größte der vier Landestheater in Nordrhein-Westfalen und das einzige mit einem Musiktheaterensemble.	Kultur & Freizeit	/assets/hornbadmeinberg/attractions/umgebung-109.jpg	Theaterplatz 1, 32756 Detmold	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	109	2025-12-02 08:41:45.834652	2025-12-02 08:41:45.834652	Sehenswürdigkeiten in der Umgebung
51	tenant_hornbadmeinberg_001	Tierpark Bad Pyrmont	Der Tierpark ist vor allem beliebt wegen seiner Nähe zu den Tieren und der Möglichkeit, die Pflanzen- und Tierwelt auf eine ganz eigene Art und Weise zu erkunden.	Natur & Tiere	/assets/hornbadmeinberg/attractions/umgebung-110.jpg	Ohrbergstraße, 31812 Bad Pyrmont	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	110	2025-12-02 08:41:46.152894	2025-12-02 08:41:46.152894	Sehenswürdigkeiten in der Umgebung
52	tenant_hornbadmeinberg_001	Schloss Brake - Weserrenaissance-Museum	Schloss Brake wurde ab 1584 als Residenz der Grafen zur Lippe im Stil der Renaissance ausgebaut. 1986 entstand das Weserrenaissance-Museum.	Kultur & Geschichte	/assets/hornbadmeinberg/attractions/umgebung-111.jpg	Schlossstraße 18, 32657 Lemgo	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	111	2025-12-02 08:41:46.467599	2025-12-02 08:41:46.467599	Sehenswürdigkeiten in der Umgebung
53	tenant_hornbadmeinberg_001	Gartenschau Bad Lippspringe	Die Landesgartenschau fand 2017 statt und eignet sich als ganzjähriges Ausflugsziel für Familien und Naturfreunde. Themen- und Mustergärten, Spielplätze, Waldidylle und farbenfrohe Blumenpracht.	Parks & Gärten	/assets/hornbadmeinberg/attractions/umgebung-112.jpg	Arminiuspark, 33175 Bad Lippspringe	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	112	2025-12-02 08:41:46.780383	2025-12-02 08:41:46.780383	Sehenswürdigkeiten in der Umgebung
54	tenant_hornbadmeinberg_001	Huxarium Gartenpark Höxter	Der Huxarium Gartenpark verbindet die historische Fachwerkstadt mit dem Welterbe Corvey. Das Gelände erstreckt sich vom Wall über die Stadtmauer und Uferpomenade der Weser bis zum Barockschloss Corvey und dem Archäologiepark.	Parks & Gärten	/assets/hornbadmeinberg/attractions/umgebung-113.jpg	Höxter	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	113	2025-12-02 08:41:47.399883	2025-12-02 08:41:47.399883	Sehenswürdigkeiten in der Umgebung
55	tenant_hornbadmeinberg_001	Bad Meinberg	Das Staatsbad Meinberg besitzt mit seinem Schwefelmoor, Kohlensäure- und Heilwasserquellen viele natürliche Heilmittel. Der Historische Kurpark, der Seekurpark und der Länderwaldpark Silvaticum laden zum Naturgenießen ein.	\N	/assets/hornbadmeinberg/attractions/ortsteil-200.jpg	\N	\N	200	2025-12-02 08:47:59.939775	2025-12-02 08:47:59.939775	16 Ortsteile
56	tenant_hornbadmeinberg_001	Belle	Im örtlichen Freibad werden heiße Tage erfrischt. Im Dorfzentrum befindet sich eine kleine Kirche, die einzige erhaltene Fachwerkkapelle im Weserbergland unter Denkmalschutz. Der Straußenhof Möller bietet Eier, Likör und Führungen an.	\N	/assets/hornbadmeinberg/attractions/ortsteil-201.jpg	\N	\N	201	2025-12-02 08:48:00.356486	2025-12-02 08:48:00.356486	16 Ortsteile
57	tenant_hornbadmeinberg_001	Bellenberg	Die im Jahr 1949 gegründete Freilichtbühne Bellenberg begeistert jedes Jahr mit einem tollen Programm für die ganze Familie. Erstmals erwähnt wurde der Ort 1507 als Bellintrupp.	\N	/assets/hornbadmeinberg/attractions/ortsteil-202.jpg	\N	\N	202	2025-12-02 08:48:00.774268	2025-12-02 08:48:00.774268	16 Ortsteile
58	tenant_hornbadmeinberg_001	Billerbeck	Das idyllische Dorf liegt am Rande des Norderteich. Dieser künstlich angelegte See liegt im ältesten Naturschutzgebiet in Lippe und diente zur Zucht von Karpfen und Hechten.	\N	/assets/hornbadmeinberg/attractions/ortsteil-203.jpg	\N	\N	203	2025-12-02 08:48:01.091734	2025-12-02 08:48:01.091734	16 Ortsteile
59	tenant_hornbadmeinberg_001	Veldrom	Die Bollmühle (Wassermühle) ist ein Baudenkmal am Silberbach. Der Preußische Velmerstot (464 m) und der Lippische Velmerstot (441 m) bieten eine atemberaubende Aussicht.	\N	/assets/hornbadmeinberg/attractions/ortsteil-204.jpg	\N	\N	204	2025-12-02 08:48:01.505574	2025-12-02 08:48:01.505574	16 Ortsteile
60	tenant_hornbadmeinberg_001	Feldrom/Kempen	Im Traktorenmuseum in Kempen stehen 60 Traktoren aus aller Welt. Es zeigt die Entwicklung der Landwirtschaft vom Mittelalter bis in die 1960er Jahre. Auf „Gut Kempen" werden heute Pferde gezüchtet.	\N	/assets/hornbadmeinberg/attractions/ortsteil-205.jpg	\N	\N	205	2025-12-02 08:48:01.822038	2025-12-02 08:48:01.822038	16 Ortsteile
61	tenant_hornbadmeinberg_001	Fissenknick	Die aufwendig restaurierte Windmühle aus dem Jahre 1847 ist Aussichtsturm und beliebtes Restaurant in wunderschöner landschaftlicher Lage.	\N	/assets/hornbadmeinberg/attractions/ortsteil-206.jpg	\N	\N	206	2025-12-02 08:48:02.234938	2025-12-02 08:48:02.234938	16 Ortsteile
62	tenant_hornbadmeinberg_001	Fromhausen	Hier erwartet Sie ein Meer aus lila Blüten. Lavendelfelder von Taoasis blühen von Juni bis August. Der Rosenhof-Lippe bietet Eselwanderungen, Esel-Relax-Kuschelzeit und Wohnmobilstellplätze an.	\N	/assets/hornbadmeinberg/attractions/ortsteil-207.jpg	\N	\N	207	2025-12-02 08:48:02.648646	2025-12-02 08:48:02.648646	16 Ortsteile
63	tenant_hornbadmeinberg_001	Holzhausen-Externsteine	Staatlich anerkannter Luftkurort und Zuhause der sagenumwobenen Externsteine. Der kleine Kurpark lädt zum Verweilen ein. Besonders ruhig, da der Ort keinen Durchgangsverkehr hat.	\N	/assets/hornbadmeinberg/attractions/ortsteil-208.jpg	\N	\N	208	2025-12-02 08:48:02.963684	2025-12-02 08:48:02.963684	16 Ortsteile
64	tenant_hornbadmeinberg_001	Heesten	Die historische Warte auf dem Ziegenberg, eine Turm-Ruine inmitten des Waldes, wurde 1442 erbaut. Das FFH-Schutzgebiet „Silberbachtal mit Ziegenberg" liegt unweit entfernt. Auf dem Rittergut Küterbrok ist Kuhkuscheln angesagt.	\N	/assets/hornbadmeinberg/attractions/ortsteil-209.jpg	\N	\N	209	2025-12-02 08:48:03.376501	2025-12-02 08:48:03.376501	16 Ortsteile
65	tenant_hornbadmeinberg_001	Horn	Horn wurde ca. 1234 gegründet und ist die zweitälteste Stadt im Kreis Lippe. Der gut erhaltene historische Stadtkern mit alter Stadtmauer und liebevoll restaurierten Häusern zeigt die historische Vergangenheit. Im Museum in der Burg lässt sich viel entdecken.	\N	/assets/hornbadmeinberg/attractions/ortsteil-210.jpg	\N	\N	210	2025-12-02 08:48:03.689979	2025-12-02 08:48:03.689979	16 Ortsteile
66	tenant_hornbadmeinberg_001	Leopoldstal	Der Ort wurde 1789 von Fürst Leopold I. gegründet. Hier sprudelt die Silberbachquelle und wird zum Silberbach. Neben Silbermühle und Kattenmühle wartet ein toller Blick vom Velmerstot auf Sie.	\N	/assets/hornbadmeinberg/attractions/ortsteil-211.jpg	\N	\N	211	2025-12-02 08:48:04.103079	2025-12-02 08:48:04.103079	16 Ortsteile
67	tenant_hornbadmeinberg_001	Schmedissen	Schmedissen wurde 1015 als Smithessun erstmals schriftlich erwähnt. Das idyllische Dorf liegt direkt am Gustav-Mesch-Wanderweg.	\N	/assets/hornbadmeinberg/attractions/ortsteil-212.jpg	\N	\N	212	2025-12-02 08:48:04.516101	2025-12-02 08:48:04.516101	16 Ortsteile
68	tenant_hornbadmeinberg_001	Vahlhausen	Im Sommer bietet das Waldfreibad Spiel, Spaß und eine nasse Erfrischung. Der älteste Ortsteil Horn-Bad Meinbergs feierte 2022 sein 1175-jähriges Jubiläum.	\N	/assets/hornbadmeinberg/attractions/ortsteil-213.jpg	\N	\N	213	2025-12-02 08:48:04.833122	2025-12-02 08:48:04.833122	16 Ortsteile
69	tenant_hornbadmeinberg_001	Wehren	In Wehren plätschert die Werre-Quelle in einer sumpfartigen Umgebung fast unauffällig aus der Erde. Sie fließt durch den Kurpark von Bad Meinberg. Wehren wurde 1173 erstmals schriftlich erwähnt. Bei der Wollfühloase können Wanderungen mit Alpakas unternommen werden.	\N	/assets/hornbadmeinberg/attractions/ortsteil-214.jpg	\N	\N	214	2025-12-02 08:48:05.24613	2025-12-02 08:48:05.24613	16 Ortsteile
70	tenant_hornbadmeinberg_001	Wilberg	Hier befinden sich die Niedermühle zu Wilberg aus dem Jahre 1698 und die Wilberger Obermühle von ca. 1574. Im Red Horn District, dem Musikclub in Horn-Bad Meinberg, gibt es Jazz- und Popmusik. Hier ist auch das District Studio, ein voll ausgestattetes Tonstudio.	\N	/assets/hornbadmeinberg/attractions/ortsteil-215.jpg	\N	\N	215	2025-12-02 08:48:05.55935	2025-12-02 08:48:05.55935	16 Ortsteile
47	tenant_hornbadmeinberg_001	Freizeitzentrum SchiederSee	Das Freizeitzentrum bietet Aktivitäten für Groß und Klein mit garantiertem Spaßfaktor. Bei einer einstündigen Rundfahrt kann der Stausee erkundet werden.	Freizeit & Erholung	/assets/hornbadmeinberg/attractions/umgebung-106.jpg	Horn-Bad Meinberg	https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html	106	2025-12-02 08:41:44.682596	2025-12-02 08:41:44.682596	Sehenswürdigkeiten in der Umgebung
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clubs (id, tenant_id, category_id, name, contact_person, address, phone, fax, email, website, created_at, updated_at) FROM stdin;
304	tenant_schieder_001	25	Trachtengilde Schwalenberg	Andr� Eikermann   Unterm Fleck 33   32816 Schieder-Schwalenberg                     Karte anzeigen	Eikermann   Unterm Fleck 33, 32816 Schieder-Schwalenberg                     Karte anzeigen	05284/5639	\N	info@trachtengilde-schwalenberg.de	http://www.trachtengilde-schwalenberg.de	2025-11-24 09:47:00.313697	2025-11-25 05:59:09.697277
312	tenant_schieder_001	25	Wappen (1)	\N	uche und Gepflogenh\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Frank Wiehemeier   Waldweg 2, 32816 Schieder-Schwalenberg                     Karte anzeigen	05282 / 948263	\N	\N	\N	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
313	tenant_schieder_001	25	cropped-Choralle-Logo-257x157	\N	bbel\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n         Ludolf Beermann    Am Kirchborn 3, 32816 Schieder-Schwalenberg                     Karte anzeigen	05233 /8349	\N	\N	http://choralle-mgv.de/wordpress/?page_id=90	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
314	tenant_schieder_001	25	WhatsApp Image 2022-02-01 at 12.13.42	\N	Spielmannszug Brakelsiek\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Larissa Wienke   Eggersberg 16a, 32816 Schieder-Schwalenberg                     Karte anzeigen\n                                          \n            \n                            \n                                                 www	\N	\N	spielmannszug.brakelsiek@gmx.de	http://www.brakelsiek.de/verzeichnis/spielmannszug	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
315	tenant_schieder_001	25	Fan Club 04 @FC Schalke Fan Club	\N	Club Brakelsiek\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Peter Meinberg Vorsitzender  Sportweg 8, 32816 Schieder-Schwalenberg                     Karte anzeigen	0170/2139056	\N	PeterMeinberg@S04-Fan-Club-Brakelsiek.de	http://schalker-fan-club.s04-fan-club-brakelsiek.de/	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
316	tenant_schieder_001	25	Logo @F�rderverein Grundschuke	\N	rderverein der Grundschule Schwalenberg\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Fabienne Schweizer   Brinkfeldweg 2, 32816 Schieder-Schwalenberg                     Karte anzeigen	\N	\N	Info@grundschule-Schwalenberg.de	http://www.gs-schwalenberg.de/seite/398458/f%C3%B6rderverein.html	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
317	tenant_schieder_001	24	Wasserrad-Antrieb	\N	Heimatverein Schieder\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Ulrich Opel   Die Helle 27, 32816 Schieder-Schwalenberg                     Karte anzeigen	05282 / 6115	\N	hu.opel@t-online.de	http://www.papiermuehle-ploeger.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
318	tenant_schieder_001	25	Kelter und Kultur Verein_3	\N	Schwalenberg\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n         Regina Zelms    Polhof 3, 32816 Schieder-Schwalenberg                     Karte anzeigen	\N	\N	info@kelterundkultur.de	https://www.facebook.com/KelterUndKulturvereinSchwalenberg/	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
319	tenant_schieder_001	25	Logo Kunstverein	\N	5, 32816 Schieder-Schwalenberg                     Karte anzeigen\n                                          \n            \n                            \n                                       Frau Ntephe	\N	\N	info@kunstverein-schieder-schwalenberg.de	\N	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
320	tenant_schieder_001	25	Unbenannt	\N	\N	0172/2708851	\N	LSG-Lippe-Suedost@t-online.de	http://www.lsg-lippe.de/	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
321	tenant_schieder_001	25	MFC	\N	e 2, 32816 Schieder-Schwalenberg                     Karte anzeigen	05282 / 2084968	\N	dirkvogel1966@gmail.com	http://www.mfc-burgschwalbe.jimdo.com	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
322	tenant_schieder_001	25	D�m�ne_2006002	\N	ne 2, 32816 Schieder-Schwalenberg                     Karte anzeigen	05282/ 8620	\N	M.Fueller@biologischestationlippe.de	http://www.biologischestationlippe.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
323	tenant_schieder_001	25	Wappen SG Lothe	\N	\N	\N	\N	sgolueke@lotherschuetzen.de	http://www.lotherschuetzen.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
324	tenant_schieder_001	25	Logo	\N	\N	05282 / 948480	\N	\N	http://www.harzberg-glashuette.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
325	tenant_schieder_001	25	Logo F�rderverein	\N	e 8, 32816 Schieder-Schwalenberg                     Karte anzeigen	\N	\N	freibad-schieder-schwalenberg@gmx.de	http://www.freibad-schieder-schwalenberg.net	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
326	tenant_schieder_001	24	Ruderclub Schieder Logo	\N	\N	05234-204845	\N	info@ruderclub-schieder.de	http://www.ruderclub-schieder.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
327	tenant_schieder_001	24	Segel-Club Schieder-Emmersee	Stefan Sanders   Schumannstr. 19   32657 Lemgo                     Karte anzeigen	19, 32657 Lemgo                     Karte anzeigen\n                                          \n            \n                            \n                                                 www	\N	\N	as_sanders@t-online.de	http://www.scse.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
250	tenant_schieder_001	24	TG Siekholz	Martin Schulz   Siekholzer Stra�e 20   32816 Schieder-Schwalenberg                     Karte anzeigen	e 20, 32816 Schieder-Schwalenberg                     Karte anzeigen	05282 / 969556	\N	martinschulz3@aol.com	\N	2025-11-24 09:47:00.313697	2025-11-25 05:59:09.697277
328	tenant_schieder_001	24	TSV Lothe Logo-gruen-schwarz	\N	e 4, 32816 Schieder-Schwalenberg                     Karte anzeigen	05233 / 4717	\N	TSVLothe@web.de	http://www.tsv-lothe.de	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
329	tenant_schieder_001	24	TuS W�bbel	05233 / 4710	e 5, 32816 Schieder-Schwalenberg                     Karte anzeigen	05233 / 4710	\N	\N	\N	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
252	tenant_schieder_001	24	TuS 08 Brakelsiek	05284 5481	Brakelsiek\n            \n\n    \n    \n                          \n                                            \n                             \n             \n    \n    \n        \n                    \n            \n                \n          Hartmut Tewesmeier Vorsitzender  Freverts Berg 10, 32816 Schieder-Schwalenberg                     Karte anzeigen	\N	\N	hartmut.tewesmeier@gmx.de	http://www.tus08brakelsiek.de	2025-11-24 09:47:00.313697	2025-11-25 05:59:09.697277
330	tenant_schieder_001	24	Verein der Woche Foto LZ @TuS RW Schieder	\N	\N	\N	\N	Vorstand@TuS-Schieder-Schwalenberg.de	\N	2025-11-25 05:59:09.697277	2025-11-25 05:59:09.697277
348	tenant_hornbadmeinberg_001	26	Heimatverein Horn e. V.	\N	Stettiner Straße 7  32805 Horn-Bad Meinberg	05234 98545	\N	anne.oelers-albertin@heimatverein-horn.de	https://www.heimatverein-horn.de/	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
241	tenant_schieder_001	24	1. Pyrmonter Segel- und Wassersportclub e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
242	tenant_schieder_001	24	DLRG Ortsgruppe Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
243	tenant_schieder_001	24	Schießsportverein Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
244	tenant_schieder_001	24	Schützengesellschaft Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
245	tenant_schieder_001	24	Schützengesellschaft Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
246	tenant_schieder_001	24	Schützengruppe Siekholz	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
247	tenant_schieder_001	24	Schützenverein Siekholz	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
248	tenant_schieder_001	24	Stadtsportverband	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
249	tenant_schieder_001	24	Tennisclub Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
251	tenant_schieder_001	24	TSV Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
253	tenant_schieder_001	24	TuS Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
254	tenant_schieder_001	24	TuS Wöbbel	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
255	tenant_schieder_001	25	Angelsportverein Schieder	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
256	tenant_schieder_001	25	Angelsportverein Schieder Glashütte	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
257	tenant_schieder_001	25	Ankerplatz	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
258	tenant_schieder_001	25	Biologische Station Lippe e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
259	tenant_schieder_001	25	Brieftaubenverein Frohes Wiedersehen Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
260	tenant_schieder_001	25	Brieftaubenverein Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
261	tenant_schieder_001	25	Brieftaubenverein Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
262	tenant_schieder_001	25	Bürgerstiftung Schwalenberg - Stiftungsrat	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
263	tenant_schieder_001	25	Bürgerstiftung Schwalenberg - Vorstand	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
264	tenant_schieder_001	25	Der Tisch in Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
265	tenant_schieder_001	25	DRK Ortsverein Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
266	tenant_schieder_001	25	Evangelische Pfadfinderschaft Europas - Stamm Schieder	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
267	tenant_schieder_001	25	FC Schalke 04 Fan Club Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
268	tenant_schieder_001	25	Förderverein Brakelsieker Mehrzweckhalle	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
269	tenant_schieder_001	25	Förderverein der Grundschule Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
270	tenant_schieder_001	25	Förderverein Freibad Schieder-Schwalenberg e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
271	tenant_schieder_001	25	Förderverein Jugendfeuerwehr Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
272	tenant_schieder_001	25	Förderverein Löschzug Schieder	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
273	tenant_schieder_001	25	Förderverein Schloss und Schlosspark Schieder	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
274	tenant_schieder_001	25	Freiwillige Feuerwehr der Stadt Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
275	tenant_schieder_001	25	Freundschaft - druschba e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
276	tenant_schieder_001	25	Geflügelzuchtverein Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
277	tenant_schieder_001	25	Geflügelzuchtverein Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
278	tenant_schieder_001	25	Heimat- und Verkehrsverein Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
279	tenant_schieder_001	25	Heimat- und Verkehrsverein Brakelsiek - Grillhütte	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
280	tenant_schieder_001	25	Heimat- und Verkehrsverein Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
281	tenant_schieder_001	25	Heimat- und Verkehrsverein Lothe - Grillhütte	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
282	tenant_schieder_001	25	Heimat- und Verkehrsverein Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
283	tenant_schieder_001	25	Heimat- und Verkehrsverein Siekholz	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
284	tenant_schieder_001	25	Heimatverein Wöbbel e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
285	tenant_schieder_001	25	Heimatverein Wöbbel e.V. - Grillhütte	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
286	tenant_schieder_001	25	Jugendkreis Brakelsiek JKB e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
287	tenant_schieder_001	25	Jugendkreis Lothe e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
288	tenant_schieder_001	25	Jugendzentrum Church Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
289	tenant_schieder_001	25	Kolibri - Förderverein für offene Kinder- und Jugendarbeit Schwalenberg e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
290	tenant_schieder_001	25	Kunstverein Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
291	tenant_schieder_001	25	Landfrauenverband Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
292	tenant_schieder_001	25	Luftsportgemeinschaft Lippe Südost e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
293	tenant_schieder_001	25	MärchenWerkSTadt e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
294	tenant_schieder_001	25	MGV Wöbbel	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
295	tenant_schieder_001	25	Musikzug der Freiwilligen Feuerwehr Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
296	tenant_schieder_001	25	Naturschutzbund Deutschland NABU - Arbeitsgruppe Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
297	tenant_schieder_001	25	Ökumenischer Chor der Kirchengemeinden in Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
298	tenant_schieder_001	25	OPEL Club Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
299	tenant_schieder_001	25	PS Freunde Lippe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
300	tenant_schieder_001	25	Schwalenberger Brauzunft	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
301	tenant_schieder_001	25	Seniorentreff Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
302	tenant_schieder_001	25	Sozialverband VdK Ortsverband Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
303	tenant_schieder_001	25	Spielmannszug Brakelsiek	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
305	tenant_schieder_001	25	Verein für Deutsche Schäferhunde OG Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
306	tenant_schieder_001	25	Verein für Deutsche Schäferhunde OG Wöbbel	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
307	tenant_schieder_001	25	Verein zur Hilfe für Aussiedler und Spätaussiedler Freundschaft - druschba e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
308	tenant_schieder_001	25	VFDG - Verein zur Förderung und Organisation zur Erhaltung alter Lippischer Gebräuche und Gepflogenheiten	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
309	tenant_schieder_001	25	Wanderarbeiterverein Lothe	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
310	tenant_schieder_001	25	Wirtschaftsinitiative Schieder-Schwalenberg	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
311	tenant_schieder_001	25	Wortmann Fischer e.V.	\N	\N	\N	\N	\N	\N	2025-11-24 09:47:00.313697	2025-11-24 09:47:00.313697
333	tenant_hornbadmeinberg_001	26	Bad Meinberg e. V.	\N	Brunnenstraße 43  32805 Horn-Bad Meinberg	05234 / 880316	\N	info@badmeinbergev.de	https://www.badmeinbergev.de/	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.025411
332	tenant_hornbadmeinberg_001	26	BC Bad Meinberg E.V. 2017	1. Vorsitzende Manuela Stoll - Jugendleiter  Andreas Stoll	Mittelstrasse 9  32805 Horn Bad Meinberg	01517 030 61 89	\N	manuela.stoll@bc-bad-meinberg.de	https://www.bc-bad-meinberg.de/	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.027294
337	tenant_hornbadmeinberg_001	26	Deutsches Rotes Kreuz - Ortsverein Horn	\N	Mittelstraße 73  32805 Horn-Bad Meinberg	05234 / 2487	\N	info@schlanstein.net	https://www.google.de/maps?t=m&hl=de&q=Mittelstra%C3%9Fe+73%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.027585
344	tenant_hornbadmeinberg_001	26	Heimat- und Verkehrsverein Kempen/Veldrom	\N	Engeweg 1a  32805 Horn-Bad Meinberg	05234 / 2932	\N	Marisveldrom@hotmail.com	\N	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.027842
345	tenant_hornbadmeinberg_001	26	Heimatfreunde Napetal e.V. / Billerbeck	\N	Marktplatz 432805 Horn-Bad Meinberg	\N	\N	anjawittfeld@gmx.de	http://www.heimatfreunde-naptetal.de/	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.028084
350	tenant_hornbadmeinberg_001	26	I.H.G. InHornGemeinsam e. V.	\N	Mittelstraße 4  32805 Horn-Bad Meinberg	05234 / 2091	\N	info@inhorngemein sam.de	http://www.inhorngemein sam.de	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.028353
351	tenant_hornbadmeinberg_001	26	Leichtathletik-Gemeinschaft (LG) Lippe-Süd	Dr. Guido Mertens	Marktplatz 432805 Horn-Bad Meinberg	05235-4509072	\N	guidomertens@hotmail.de	http://www.lglippesued.de	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.028587
352	tenant_hornbadmeinberg_001	26	Luftsportgemeinschaft Lippe Südost e.V.	\N	Nessenbergstrasse 6 Flugplatz Blomberg - Borkhausen 32825 Blomberg		\N	post@horn-badmeinberg.de	http://www.lsg-lippe.de	2025-12-03 03:25:51.678538	2025-12-03 03:35:02.028892
331	tenant_hornbadmeinberg_001	26	ADFC Station im Stadtteil Bad Meinberg	\N	Brunnenstraße 67 Gästehaus Havergoh 32805 Horn-Bad Meinberg	05234-9754	\N	info@havergoh.de	http://www.adfc-nrw.de/lippe	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
334	tenant_hornbadmeinberg_001	26	Brieftaubenverein Belle	\N	Ulmenstr. 26  32805 Horn-Bad Meinberg	05234 / 99400	\N	mnm.mueller@t-online.de	https://www.google.de/maps?t=m&hl=de&q=Ulmenstr.+26%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
335	tenant_hornbadmeinberg_001	26	Bürgerbündnis Horn-Bad Meinberg	\N	Steinheimer Straße 273  32805 Horn-Bad Meinberg	01704738484	\N	info@bürgerbündnis-hbm.de	https://www.google.de/maps?t=m&hl=de&q=Steinheimer+Stra%C3%9Fe+273%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
336	tenant_hornbadmeinberg_001	26	CDU Horn-Bad Meinberg	\N	Mittelstraße 59  32805 Horn-Bad Meinberg		\N	vorsitz@cdu-hbm.de	http://www.cdu-hbm.de	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
341	tenant_hornbadmeinberg_001	26	Förderverein Freibad Bad Meinberg e. V.	\N	Hamelner Straße 103  32805 Horn-Bad Meinberg	05234 / 98490	\N	info@bad-meinberger-waldbad.de	http://bad-meinberger-waldbad.de/	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
338	tenant_hornbadmeinberg_001	26	Frauenchor Glocke	\N	Ulmenstr. 26  32805 Horn-Bad Meinberg	05234 / 99400	\N	mnm.mueller@ t-online.de	https://www.google.de/maps?t=m&hl=de&q=Ulmenstr.+26%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
339	tenant_hornbadmeinberg_001	26	Frauenchor Harmonie Horn	\N	Jahnstraße 26  32805 Horn-Bad Meinberg	05234 / 4300	\N	post@horn-badmeinberg.de	https://www.google.de/maps?t=m&hl=de&q=Jahnstra%C3%9Fe+26%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
340	tenant_hornbadmeinberg_001	26	Freilichtbühne Bellenberg e. V.	\N	Meierberg 15 Spielstätte: Zur Freilichtbühne, 32805 Horn-Bad Meinberg 32805 Horn-Bad Meinberg		\N	post@horn-badmeinberg.de	http://www.freilichtbuehne-bellenberg.de	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
342	tenant_hornbadmeinberg_001	26	HC Horn-Bad Meinberg	\N	Stralsunder Str. 21  32805 Horn-Bad Meinberg	05234/3709	\N	post@horn-badmeinberg.de	https://www.google.de/maps?t=m&hl=de&q=Stralsunder+Str.+21%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
343	tenant_hornbadmeinberg_001	26	Heimat- und Verkehrsverein Feldrom/Veldrom/Kempen	\N	Heinrichstraße 25  32805 Horn-Bad Meinberg	05234/2679	\N	post@horn-badmeinberg.de	https://www.google.de/maps?t=m&hl=de&q=Heinrichstra%C3%9Fe+25%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
346	tenant_hornbadmeinberg_001	26	Heimatverein Bad Meinberg e. V.	\N	Salzbrunner Weg 8  32805 Horn-Bad Meinberg	05234/98270	\N	info@hv-badmeinberg.de	http://www.hv-badmeinberg.de	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
347	tenant_hornbadmeinberg_001	26	Heimatverein Belle e. V.	\N	Reesenkamp 5  32805 Horn-Bad Meinberg	0160 / 834 68 05	\N	post@horn-badmeinberg.de	https://www.google.de/maps?t=m&hl=de&q=Reesenkamp+5%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
349	tenant_hornbadmeinberg_001	26	Hotel- und Gaststättenverband Horn-Bad Meinberg e. V.	\N	Brunnenstraße 67  32805 Horn-Bad Meinberg	05234 / 9754 (	\N	info@havergoh.de	https://www.google.de/maps?t=m&hl=de&q=Brunnenstra%C3%9Fe+67%2C+32805+Horn-Bad+Meinberg	2025-12-03 03:25:51.678538	2025-12-03 03:34:22.3613
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, tenant_id, name, icon, display_order, created_at, updated_at) FROM stdin;
1	tenant_schieder_001	Fachbereich Stadtentwicklung	Building	4	2025-11-23 06:01:01.987037	2025-11-23 06:01:01.987037
2	tenant_schieder_001	Bauhof	Wrench	5	2025-11-23 06:01:01.989028	2025-11-23 06:01:01.989028
3	tenant_schieder_001	Fachbereich Finanzen und Organisation	Calculator	2	2025-11-23 06:01:01.989794	2025-11-23 06:01:01.989794
4	tenant_schieder_001	Fachbereich Ordnung und Soziales	Users	3	2025-11-23 06:01:01.990549	2025-11-23 06:01:01.990549
5	tenant_schieder_001	Auszubildende	GraduationCap	8	2025-11-23 06:01:01.991265	2025-11-23 06:01:01.991265
6	tenant_schieder_001	Betreuung	Heart	9	2025-11-23 06:01:01.992216	2025-11-23 06:01:01.992216
7	tenant_schieder_001	Touristinfo	MapPin	7	2025-11-23 06:01:01.993008	2025-11-23 06:01:01.993008
18	tenant_hornbadmeinberg_001	Kläranlage	Wrench	0	2025-12-02 07:04:55.398864	2025-12-02 07:04:55.398864
11	tenant_hornbadmeinberg_001	Stadtwerke, Umwelt und öffentliche Einrichtungen	Heart	0	2025-12-02 07:04:55.347697	2025-12-02 07:17:22.300581
20	tenant_hornbadmeinberg_001	Pressestelle	Info	0	2025-12-02 07:04:55.40201	2025-12-02 07:17:22.34445
16	tenant_hornbadmeinberg_001	Leiterin	Crown	0	2025-12-02 07:04:55.394564	2025-12-02 07:17:22.338154
19	tenant_hornbadmeinberg_001	Bürgermeister	Crown	-1	2025-12-02 07:04:55.400602	2025-12-02 07:04:55.400602
15	tenant_hornbadmeinberg_001	Finanzen	Calculator	0	2025-12-02 07:04:55.387134	2025-12-02 07:17:22.331633
8	tenant_hornbadmeinberg_001	Bildung, Ordnung und Soziales	Users	0	2025-12-02 07:04:31.729091	2025-12-02 07:17:22.2695
13	tenant_hornbadmeinberg_001	Stadtentwicklung, Bauen und Liegenschaften	Building	0	2025-12-02 07:04:55.37459	2025-12-02 07:17:22.321427
10	tenant_hornbadmeinberg_001	Baubetriebshof	Wrench	0	2025-12-02 07:04:55.345565	2025-12-02 07:17:22.296217
14	tenant_hornbadmeinberg_001	Allgemeine Verwaltung	Briefcase	0	2025-12-02 07:04:55.384322	2025-12-02 07:17:22.329588
12	tenant_hornbadmeinberg_001	Zentrale Dienste / Personal	Users	0	2025-12-02 07:04:55.361214	2025-12-02 07:17:22.31114
17	tenant_hornbadmeinberg_001	Stabsstelle	Info	0	2025-12-02 07:04:55.396232	2025-12-02 07:17:22.339531
\.


--
-- Data for Name: education_facilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.education_facilities (id, tenant_id, category_id, name, address, phone, fax, email, website, opening_hours, description, created_at, updated_at) FROM stdin;
1	tenant_schieder_001	1	AWO - Kindertagesstätte "Drachennest"	Tulpenstraße 16, 32816 Horn-Bad Meinberg	05233 / 93795						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
2	tenant_schieder_001	1	DRK Kindergarten "Wurzelhöhle"	Ahornweg 5, 32816 Horn-Bad Meinberg	05233 / 93971						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
3	tenant_schieder_001	1	Kindergarten "Wildblume" der Evangelisch-reformierten Kirchengemeinde Schwalenberg	32816 Horn-Bad Meinberg	05284 / 331						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
4	tenant_schieder_001	1	Katholischer Kindergarten St. Joseph	32816 Horn-Bad Meinberg	05282 / 8246						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
5	tenant_schieder_001	1	Städtischer Kindergarten "Rappelkiste"	Schubertstraße 10, 32816 Horn-Bad Meinberg	05282 / 6342						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
6	tenant_schieder_001	1	Tageseinrichtung im SOS-Kinderdorf Lippe	Forstweg 1, 32816 Horn-Bad Meinberg	05284 / 94 27 16						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
10	tenant_schieder_001	3	Bücherei Wöbbel	Kastanienweg 7, 32816 Horn-Bad Meinberg	05233 / 954286						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
7	tenant_schieder_001	2	Grundschule am Schloßpark	Parkallee 7, 32816 Horn-Bad Meinberg	05234 / 201-700	05234 / 201-9700					2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
8	tenant_schieder_001	2	Alexander-Zeiß-Grundschule	Brinkfeldweg 2, 32816 Horn-Bad Meinberg	05234 / 201-600	05234 / 201-9600					2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
9	tenant_schieder_001	3	Bücherei Schieder	32816 Horn-Bad Meinberg	05234 / 20160						2025-11-23 07:48:53.465546	2025-11-23 07:48:53.465546
\.


--
-- Data for Name: education_institutions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.education_institutions (id, tenant_id, name, category, description, address, phone, fax, email, website, display_order, created_at, updated_at) FROM stdin;
1	tenant_hornbadmeinberg_001	Grundschule am Silvaticum	Grundschulen	Grundschulverbund Bad Meinberg – Belle mit Standort Bad Meinberg. Offene Ganztagsschule mit ca. 145 Schülern in 8 Klassen.	Müllerberg, 32805 Horn-Bad Meinberg	05234 / 9765	05234 / 99084	GSBadMeinberg@horn-badmeinberg.de	https://www.horn-badmeinberg.de/Leben-Freizeit/Bildung/Schulen/Grundschule-am-Silvaticum/	1	2025-12-02 09:14:59.552277	2025-12-02 09:14:59.552277
2	tenant_hornbadmeinberg_001	Grundschule Horn	Grundschulen	Grundschule in Horn mit Offener Ganztagsbetreuung.	Mittelstraße 12, 32805 Horn-Bad Meinberg	05234 / 7343	05234 / 88651	GSHorn@horn-badmeinberg.de	https://www.horn-badmeinberg.de/Leben-Freizeit/Bildung/Schulen/Grundschule-Horn/	2	2025-12-02 09:14:59.554375	2025-12-02 09:14:59.554375
3	tenant_hornbadmeinberg_001	Sekundarschule Horn-Bad Meinberg	Sekundarschule	Sekundarschule mit den Jahrgängen 5-10. Längeres gemeinsames Lernen mit individueller Förderung.	Mittelstraße 10, 32805 Horn-Bad Meinberg	05234 / 9880-0	05234 / 9880-20	sekretariat@sekundarschule-hbm.de	https://www.sekundarschule-hbm.de	3	2025-12-02 09:14:59.555064	2025-12-02 09:14:59.555064
4	tenant_hornbadmeinberg_001	Gymnasium Horn-Bad Meinberg	Gymnasium	Städtisches Gymnasium mit ca. 900 Schülern. Offene Ganztagsschule mit vielfältigen AG-Angeboten.	Am Silvaticum 1, 32805 Horn-Bad Meinberg	05234 / 9814-0	05234 / 9814-20	sekretariat@gymnasium-hbm.de	https://www.gymnasium-hbm.de	4	2025-12-02 09:14:59.555601	2025-12-02 09:14:59.555601
5	tenant_hornbadmeinberg_001	VHS Detmold-Lemgo	VHS	Volkshochschule Detmold-Lemgo mit Außenstelle in Horn-Bad Meinberg. Vielfältiges Kursangebot für Erwachsenenbildung.	Krumme Straße 20, 32756 Detmold	05231 / 977-0	05231 / 977-199	info@vhs-detmold-lemgo.de	https://www.vhs-detmold-lemgo.de	5	2025-12-02 09:14:59.556128	2025-12-02 09:14:59.556128
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, tenant_id, department_id, name, title, responsibilities, phone, fax, email, room, address, office_hours, source_url, scraped_at, updated_at) FROM stdin;
13	tenant_schieder_001	5	Frau Joann Hamm	Karte anzeigen	\N	\N	\N	\N	\N	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.002435	2025-11-23 06:01:02.002435
1	tenant_schieder_001	1	Frau Andrea Bärsch	Bauanträge, Bauleitplanung, Beitragsrecht, Denkmalschutz	\N	05234/201-67	05282/601-967	\N	OG4	Im Kurpark 1	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.994047	2025-11-23 06:01:01.994047
2	tenant_schieder_001	2	Herr Mario Bezjak	Karte anzeigen	\N	05234/201-500	05282/6019-500	\N	\N	Domäne 12	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.996103	2025-11-23 06:01:01.996103
3	tenant_schieder_001	1	Herr Michael Bickel	Tiefbau, Abwasserbeseitigung, Energie, Gewässer	\N	05234/201-75	05282/601-975	\N	OG5	Im Kurpark 1	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.996977	2025-11-23 06:01:01.996977
4	tenant_schieder_001	1	Herr Reinhard Büker	Hochbau, Bauhof	\N	05234/201-66	05282/601-966	\N	OG8	Im Kurpark 1	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.997578	2025-11-23 06:01:01.997578
5	tenant_schieder_001	3	Frau Sandra Cotte	Zahlungsabwicklung	\N	05234/201-28	05282/601-928	\N	22	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.99824	2025-11-23 06:01:01.99824
6	tenant_schieder_001	3	Frau Kristin Echterling	Finanzbuchhaltung	\N	05234/201-24	\N	\N	23	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.998851	2025-11-23 06:01:01.998851
7	tenant_schieder_001	3	Frau Sandra Eichmann	Vorzimmer	\N	05234/201-12	05282/601-912	\N	3	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.99945	2025-11-23 06:01:01.99945
8	tenant_schieder_001	3	Herr Ronald Erfurth	Steuern, Grundbesitzabgaben, Abfallbeseitigung	\N	05234/201-22	05282/601-922	\N	19	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:01.999981	2025-11-23 06:01:01.999981
9	tenant_schieder_001	3	Frau Laura Blome-Haase	Schulverwaltung, Finanzbuchhaltung	\N	05234/201-65	05282/601-965	\N	\N	Domäne 3	Mo-Fr 8 - 12 Uhr	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.000475	2025-11-23 06:01:02.000475
10	tenant_schieder_001	4	Frau Sabine Haedrich	Soziales	\N	05234/201-53	05282/601-953	\N	6	Domäne 3	Mo-Di 8 - 12 Uhr, donnerstags von 8 - 12 Uhr und 14 - 17 Uhr, freitags von 8 - 12 Uhr	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.000964	2025-11-23 06:01:02.000964
11	tenant_schieder_001	4	Frau Astrid Hagedorn	Einwohnermeldewesen, Pass- und Ausweiswesen, Fundbüro, Führungszeugnis	\N	05234/201-33	05282/601-933	\N	8	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.001472	2025-11-23 06:01:02.001472
12	tenant_schieder_001	4	Frau Astrid Hagedorn	Rentenangelegenheiten	\N	05234/201-52	05282/601-952	\N	8	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.001965	2025-11-23 06:01:02.001965
14	tenant_schieder_001	6	Herr Hans-Georg Müller	Karte anzeigen	\N	05282-60154	\N	\N	10	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.002909	2025-11-23 06:01:02.002909
15	tenant_schieder_001	1	Herr Jochen Heering	Fachbereichsleiter, allgem. Vertreter des Bürgermeisters	\N	05234/201-13	05282/601-913	\N	OG1	Im Kurpark 1	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.003394	2025-11-23 06:01:02.003394
16	tenant_schieder_001	4	Frau Andrea Hoppe	Wohngeldstelle Buchstaben L-Z	\N	05234/201-25	05282/601-925	\N	\N	Domäne 3	Mo-Di 8 - 12 Uhr, donnerstags von 8 - 12 Uhr, freitags von 8 - 12 Uhr	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.003876	2025-11-23 06:01:02.003876
17	tenant_schieder_001	3	Frau Sonja Horbach	Personalservice	\N	05234/201-16	05282/601-916	\N	20	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.004363	2025-11-23 06:01:02.004363
18	tenant_schieder_001	3	Herr Swen Horstmann	Fachbereichsleiter, Kämmerer	\N	05234/201-40	05282/601-940	\N	24	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.005108	2025-11-23 06:01:02.005108
19	tenant_schieder_001	7	Frau Denise Kieslich	Karte anzeigen	\N	05234/20194	05282/601994	\N	\N	Marktstraße 5	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.005677	2025-11-23 06:01:02.005677
20	tenant_schieder_001	4	Herr Mathias Koch	Fachbereichsleiter	\N	05234/201-51	\N	\N	2	Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.006219	2025-11-23 06:01:02.006219
21	tenant_schieder_001	4	Frau Indra Krome	Wohngeldstelle Buchstaben A-K	\N	05234/201-34	05282/601-934	\N	7	Domäne 3	Mo-Di 8 - 12 Uhr, donnerstags von 8 - 12 Uhr und 14 - 17 Uhr, freitags von 8 - 12 Uhr	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.006742	2025-11-23 06:01:02.006742
22	tenant_schieder_001	1	Frau Maria Litke	Karte anzeigen	\N	05234/201-70	05282/601-970	\N	OG3	Im Kurpark 1	Mo-Fr 8 - 12 Uhr	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.007228	2025-11-23 06:01:02.007228
23	tenant_schieder_001	4	Herr Frank Luttmann	öffentliche Sicherheit und Ordnung, Gewerbeangelegenheiten	\N	05234/201-31	05282/601-931	\N	5	Domäne 3, Domäne 3	\N	https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Mitarbeiter	2025-11-23 06:01:02.007766	2025-11-23 06:01:02.007766
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, tenant_id, title, description, start_date, end_date, location, image_url, source_url, category, scraped_at, updated_at) FROM stdin;
1	tenant_schieder_001	HerzLIchtSEIN e.V.	HerzLIchtSEIN e.V.	2025-11-23 11:00:00	\N	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-11-23 11:00:00-herzlichtsein-e-v	Veranstaltung	2025-11-23 05:52:55.108309	2025-11-23 05:52:55.108309
2	tenant_schieder_001	Weihnachtsmarkt in Lothe	Weihnachtsmarkt in Lothe	2025-11-29 15:00:00	2025-11-30 22:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-11-29 15:00:00-weihnachtsmarkt-in-lothe	Veranstaltung	2025-11-23 05:52:55.111918	2025-11-23 05:52:55.111918
3	tenant_schieder_001	Schwalenberger ARTvent	Schwalenberger ARTvent	2025-11-30 15:00:00	2025-12-28 18:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-11-30 15:00:00-schwalenberger-artvent	Veranstaltung	2025-11-23 05:52:55.113312	2025-11-23 05:52:55.113312
4	tenant_schieder_001	GlühweinTreff	GlühweinTreff	2025-12-05 16:00:00	\N	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-05 16:00:00-gl-hweintreff	Veranstaltung	2025-11-23 05:52:55.114436	2025-11-23 05:52:55.114436
5	tenant_schieder_001	Kolibri Adventszauber-Der Weihnachtsmarkt in Schwalenberg	Kolibri Adventszauber-Der Weihnachtsmarkt in Schwalenberg	2025-12-06 14:00:00	2025-12-07 01:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-06 14:00:00-kolibri-adventszauber-der-weihnachtsmarkt-in-schwa	Veranstaltung	2025-11-23 05:52:55.11539	2025-11-23 05:52:55.11539
6	tenant_schieder_001	Nikolaussingen & Glühweintrinken	Nikolaussingen & Glühweintrinken	2025-12-06 17:30:00	\N	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-06 17:30:00-nikolaussingen-gl-hweintrinken	Veranstaltung	2025-11-23 05:52:55.116242	2025-11-23 05:52:55.116242
7	tenant_schieder_001	Demokratie- Stimme der Freiheit	Demokratie- Stimme der Freiheit	2025-12-07 15:00:00	2026-01-11 17:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-07 15:00:00-demokratie-stimme-der-freiheit	Veranstaltung	2025-11-23 05:52:55.117003	2025-11-23 05:52:55.117003
8	tenant_schieder_001	Schwalenberger ARTvent	Schwalenberger ARTvent	2025-12-07 15:00:00	2026-01-04 18:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-07 15:00:00-schwalenberger-artvent	Veranstaltung	2025-11-23 05:52:55.117811	2025-11-23 05:52:55.117811
9	tenant_schieder_001	Schwalenberger ARTvent	Schwalenberger ARTvent	2025-12-14 15:00:00	2026-01-11 18:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-14 15:00:00-schwalenberger-artvent	Veranstaltung	2025-11-23 05:52:55.118846	2025-11-23 05:52:55.118846
10	tenant_schieder_001	Schwalenberger ARTvent	Schwalenberger ARTvent	2025-12-21 15:00:00	2026-01-18 18:00:00	\N	\N	https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender#2025-12-21 15:00:00-schwalenberger-artvent	Veranstaltung	2025-11-23 05:52:55.119624	2025-11-23 05:52:55.119624
11	tenant_hornbadmeinberg_001	Frühlingsfest in Horn	Buntes Kirmestreiben rund ums Rathaus vor Ostern	2025-03-20 04:00:00	\N	Horn, Rathaus	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/	\N	2025-12-02 06:34:40.182156	2025-12-02 06:34:40.182156
21	tenant_hornbadmeinberg_001	Osterfeuer	Als traditioneller Brauch werden in verschiedenen Stadtteilen Osterfeuer angezündet: Bad Meinberg, Billerbeck, Feldrom, Wehren und anderen Stadtteilen	2025-03-31 04:00:00	\N	Verschiedene Stadtteile	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#osterfeuer	\N	2025-12-02 06:34:53.60361	2025-12-02 06:34:53.60361
22	tenant_hornbadmeinberg_001	Weinfest in Bad Meinberg	Ein Fest rund um den Wein Ende Mai	2025-05-25 04:00:00	\N	Bad Meinberg	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#weinfest-in-bad-meinberg	\N	2025-12-02 06:34:53.618044	2025-12-02 06:34:53.618044
23	tenant_hornbadmeinberg_001	Kurpark-Sommerfest	Sommerfest im Kurpark Bad Meinberg	2025-08-15 04:00:00	\N	Kurpark Bad Meinberg	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#kurpark-sommerfest	\N	2025-12-02 06:34:53.63161	2025-12-02 06:34:53.63161
24	tenant_hornbadmeinberg_001	Hörnchenfest in Horn	Das Altstadtvergnügen mit verlängerter Einkaufsmöglichkeit am Samstag - Letztes Wochenende im September	2025-09-28 04:00:00	\N	Horn, Altstadt	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#hörnchenfest-in-horn	\N	2025-12-02 06:34:53.645328	2025-12-02 06:34:53.645328
25	tenant_hornbadmeinberg_001	Beller Schnirz	Traditionelles Volksfest im Stadtteil Belle - 3. Wochenende im Oktober	2025-10-18 04:00:00	\N	Belle	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#beller-schnirz	\N	2025-12-02 06:34:53.658493	2025-12-02 06:34:53.658493
26	tenant_hornbadmeinberg_001	Bauernmarkt in Bad Meinberg	Traditioneller Bauernmarkt in der Bad Meinberger Allee - 3. Wochenende im Oktober	2025-10-19 04:00:00	\N	Bad Meinberg, Allee	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#bauernmarkt-in-bad-meinberg	\N	2025-12-02 06:34:53.672186	2025-12-02 06:34:53.672186
27	tenant_hornbadmeinberg_001	Kläschen in Horn	Traditionelles Fest mit Kirmes rund um das Rathaus und verkaufsoffenem Sonntag - 3. Wochenende vor dem 1. Advent	2025-11-10 05:00:00	\N	Horn, Rathaus	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#kläschen-in-horn	\N	2025-12-02 06:34:53.685402	2025-12-02 06:34:53.685402
28	tenant_hornbadmeinberg_001	Christkindlmarkt in Bad Meinberg	Veranstaltungsort ist der Kurpark und das Kurgastzentrum - 3. Advent	2025-12-15 05:00:00	\N	Kurpark und Kurgastzentrum Bad Meinberg	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#christkindlmarkt-in-bad-meinberg	\N	2025-12-02 06:34:53.699567	2025-12-02 06:34:53.699567
29	tenant_hornbadmeinberg_001	Schützenfeste in sieben Stadtteilen	Die traditionellen Schützengesellschaften veranstalten jeweils in ihren Stadtteilen Schützenfeste: Bad Meinberg, Belle, Bellenberg, Feldrom, Horn, Kempen, Wehren	2025-06-15 04:00:00	\N	Verschiedene Stadtteile	\N	https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#schützenfeste-in-sieben-stadtteilen	\N	2025-12-02 06:34:53.712326	2025-12-02 06:34:53.712326
\.


--
-- Data for Name: help_conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.help_conversations (id, tenant_id, request_id, offer_id, requester_id, requester_name, helper_id, helper_name, status, created_at, updated_at, contact_shared) FROM stdin;
WrsQd-mksjCfdqBDfDOhV	tenant_schieder_001	test-request-1	\N	user-123	Test User	helper-456	Test Helper	active	2025-12-02 10:35:10.702	2025-12-02 10:35:16.291	t
Owm339iMfP8h0HSI41_pB	tenant_schieder_001	\N	\N	current-user	Aktueller Nutzer	current-user	Aktueller Nutzer	active	2025-12-02 10:38:40.041	2025-12-02 10:38:40.041	f
Q9j2Hh2vkUxE6ZxCsCt_0	tenant_schieder_001	\N	\N	current-user	Aktueller Nutzer	current-user	Aktueller Nutzer	active	2025-12-02 10:39:00.77	2025-12-02 10:39:31.192	f
HffsO1DspYYXc_PjbJF5D	tenant_hornbadmeinberg_001	\N	\N	current-user	Aktueller Nutzer	current-user	Aktueller Nutzer	active	2025-12-03 13:14:15.396	2025-12-03 13:14:15.396	f
\.


--
-- Data for Name: help_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.help_messages (id, conversation_id, sender_id, sender_name, message, read, created_at) FROM stdin;
zTDu0krIAgE8f4cBVX9Uw	WrsQd-mksjCfdqBDfDOhV	user-123	Test User	Hallo, ich würde gerne helfen!	t	2025-12-02 10:35:16.291
dEdXCBGS3sIghfwFpJmsj	WrsQd-mksjCfdqBDfDOhV	system	System	Test User hat die Kontaktdaten geteilt. Sie können sich nun direkt austauschen.	t	2025-12-02 10:35:27.822
uuKOyWY5sGQGh0qWsRluP	Q9j2Hh2vkUxE6ZxCsCt_0	current-user	Aktueller Nutzer	Hallo Ich habe zeit wann soll ich den Hund abholen?	f	2025-12-02 10:39:31.192
\.


--
-- Data for Name: help_offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.help_offers (id, tenant_id, created_by, created_by_name, categories, description, district, radius, availability, contact_method, phone_number, status, created_at, updated_at) FROM stdin;
I11YYBOqLTnxk4zVx0lbc	tenant_schieder_001	helper-001	Maria Weber	{shopping,companion}	Ich helfe gerne beim Einkaufen und begleite zu Arztterminen. Habe ein Auto und bin flexibel.	Schieder	5	Montag bis Freitag vormittags	phone	0152 98765432	open	2025-12-02 10:21:32.223	2025-12-02 10:21:32.223
mCkRKww9RCh_UhRabFz21	tenant_schieder_001	helper-002	Thomas Fischer	{handyman,garden}	Biete Hilfe bei kleineren Reparaturen und Gartenarbeiten. Habe eigenes Werkzeug.	Schwalenberg	10	Wochenenden	app	\N	open	2025-12-02 10:21:40.206	2025-12-02 10:21:40.206
offer_001_hbm	tenant_hornbadmeinberg_001	user_004	Julia Hoffmann	{Einkaufshilfe,Botengänge}	Ich bin 25 Jahre alt, habe ein Auto und helfe gerne beim Einkaufen oder bei Botengängen. Besonders gerne unterstütze ich ältere Menschen. Ich bin flexibel und zuverlässig.	Bad Meinberg	10	Montag bis Freitag, nachmittags ab 16 Uhr	app	\N	open	2025-12-03 02:48:38.086626	2025-12-03 02:48:38.086626
offer_002_hbm	tenant_hornbadmeinberg_001	user_005	Peter Schneider	{Gartenarbeit,"Handwerkliche Hilfe"}	Rentner mit viel Erfahrung in Garten- und Handwerksarbeiten. Ich helfe gerne bei kleineren Reparaturen, Gartenarbeiten oder beim Aufbau von Möbeln. Keine großen Projekte.	Horn	5	Flexibel, nach Absprache	phone	05234 / 11223	open	2025-12-03 02:48:38.086626	2025-12-03 02:48:38.086626
offer_003_hbm	tenant_hornbadmeinberg_001	user_006	Anna Becker	{Kinderbetreuung,Nachhilfe}	Studentin (Lehramt) bietet Kinderbetreuung und Nachhilfe für Grundschüler an. Ich habe Erfahrung mit Kindern und bin sehr geduldig. Gerne auch bei Hausaufgaben helfen.	Leopoldstal	8	Dienstag, Mittwoch und Donnerstag, 14-19 Uhr	app	\N	open	2025-12-03 02:48:38.086626	2025-12-03 02:48:38.086626
\.


--
-- Data for Name: help_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.help_requests (id, tenant_id, created_by, created_by_name, category, description, district, meeting_point, timeframe, urgency, contact_method, phone_number, status, created_at, updated_at) FROM stdin;
VCfp4k_RJ7lXvKfda63KI	tenant_schieder_001	test-123	Max Mustermann	shopping	Brauche Hilfe beim Einkaufen	Schieder	\N	Morgen vormittag	medium	app	\N	open	2025-12-02 10:15:02.264	2025-12-02 10:15:02.264
atXbVU-KH-2xD9pMBFd8A	tenant_schieder_001	user-456	Anna Schmidt	handyman	Suche Hilfe beim Aufbau eines Schranks	Schwalenberg	\N	Dieses Wochenende	low	phone	0151 12345678	open	2025-12-02 10:19:09.583	2025-12-02 10:19:09.583
9ZlaSxXh-hbkrCS6Ck515	tenant_schieder_001	user-789	Klaus Müller	companion	Begleitung zum Arzt benötigt	Schieder	\N	Morgen 10 Uhr	high	app	\N	open	2025-12-02 10:19:17.458	2025-12-02 10:19:17.458
CoawU3Yxv2ZPu_OIE3wAe	tenant_schieder_001	user-1764670958091	Anonymer Nutzer	pet	Wer geht mit meinem Hund gassi?	siekholz	\N	Am Wochenende	low	app	\N	open	2025-12-02 10:22:37.948	2025-12-02 10:22:37.948
req_001_hbm	tenant_hornbadmeinberg_001	user_001	Maria Schmidt	Einkaufshilfe	Suche jemanden, der mir beim wöchentlichen Einkauf hilft. Ich bin 78 Jahre alt und habe Schwierigkeiten, schwere Taschen zu tragen. Gerne auch regelmäßig jeden Donnerstag.	Bad Meinberg	REWE Bad Meinberg	Donnerstags, 10-12 Uhr	medium	phone	05234 / 12345	open	2025-12-03 02:48:38.08535	2025-12-03 02:48:38.08535
req_002_hbm	tenant_hornbadmeinberg_001	user_002	Thomas Müller	Gartenarbeit	Benötige Hilfe beim Heckenschneiden und Rasenmähen. Mein Garten ist ca. 300 qm groß. Würde mich über Unterstützung sehr freuen!	Horn	Mittelstraße 45, Horn	Flexibel, am besten am Wochenende	low	app	\N	open	2025-12-03 02:48:38.08535	2025-12-03 02:48:38.08535
req_003_hbm	tenant_hornbadmeinberg_001	user_003	Familie Weber	Kinderbetreuung	Suchen eine zuverlässige Betreuung für unsere beiden Kinder (5 und 7 Jahre) für 2-3 Stunden am Nachmittag, 2x pro Woche. Gerne auch Studenten oder Rentner.	Leopoldstal	Bei uns zu Hause	Dienstag und Donnerstag, 15-18 Uhr	high	phone	05234 / 67890	open	2025-12-03 02:48:38.08535	2025-12-03 02:48:38.08535
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news (id, "tenantId", title, teaser, "bodyMD", "imageUrl", category, "publishedAt", "sourceUrl", "createdAt") FROM stdin;
news_1764675033260_fnp1407fv	tenant_hornbadmeinberg_001	Nachrichten	Nachrichten	Nachrichten	\N	\N	2025-12-02 11:30:33.22	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/	2025-12-02 06:30:33.261665
news_1764675033264_e0a85dhgv	tenant_hornbadmeinberg_001	Besser informiert durch soziale Medien - Stadt Horn-Bad Meinberg ist auf Facebook und Instagram	Besser informiert durch soziale Medien - Stadt Horn-Bad Meinberg ist auf Facebook und Instagram	Besser informiert durch soziale Medien - Stadt Horn-Bad Meinberg ist auf Facebook und Instagram	https://www.horn-badmeinberg.de/media/custom/3165_438_1_m.JPG?1764163335	\N	2025-11-26 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Besser-informiert-durch-soziale-Medien-Stadt-Horn-Bad-Meinberg-ist-auf-Facebook-und-Instagram.php?object=tx,3165.5.1&ModID=7&FID=3165.3490.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.264447
news_1764675033266_yd8obg0pd	tenant_hornbadmeinberg_001	Damit alle sicher ankommen: Winterdienst erfordert Platz	Damit alle sicher ankommen: Winterdienst erfordert Platz	Damit alle sicher ankommen: Winterdienst erfordert Platz	https://www.horn-badmeinberg.de/media/custom/3165_436_1_m.JPG?1764077244	\N	2025-11-25 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Damit-alle-sicher-ankommen-Winterdienst-erfordert-Platz.php?object=tx,3165.5.1&ModID=7&FID=3165.3487.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.266868
news_1764675033267_lygnu1kci	tenant_hornbadmeinberg_001	Wunschbaumaktion in Horn-Bad Meinberg hat begonnen	Wunschbaumaktion in Horn-Bad Meinberg hat begonnen	Wunschbaumaktion in Horn-Bad Meinberg hat begonnen	https://www.horn-badmeinberg.de/media/custom/3165_435_1_m.JPG?1763990180	\N	2025-11-24 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Wunschbaumaktion-in-Horn-Bad-Meinberg-hat-begonnen.php?object=tx,3165.5.1&ModID=7&FID=3165.3485.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.26802
news_1764675033269_yf1ktfpm3	tenant_hornbadmeinberg_001	Stellenausschreibung Fachangestellte*n für Bäderbetriebe in Vollzeit und ganzjährig (m/w/d)	Die Stadt Horn-Bad Meinberg sucht für die städtische Schwimmhalle am Püngelsberg und das städtische Freibad Eggebad zum nächstmöglichen Zeitpunkt eine*n	Die Stadt Horn-Bad Meinberg sucht für die städtische Schwimmhalle am Püngelsberg und das städtische Freibad Eggebad zum nächstmöglichen Zeitpunkt eine*n	https://www.horn-badmeinberg.de/media/custom/449_1476_1_m.JPG?1581502333	\N	2025-11-13 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Stellenausschreibung-Fachangestellte-n-f%C3%BCr-B%C3%A4derbetriebe-in-Vollzeit-und-ganzj%C3%A4hrig-m-w-d-.php?object=tx,3165.5.1&ModID=7&FID=3165.3484.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.269998
news_1764675033271_3igq1y6vm	tenant_hornbadmeinberg_001	Schwimmhalle im Schulzentrum ab Montag wieder in Betrieb	Schwimmhalle im Schulzentrum ab Montag wieder in Betrieb	Schwimmhalle im Schulzentrum ab Montag wieder in Betrieb	https://www.horn-badmeinberg.de/media/custom/3165_433_1_m.JPG?1762516246	\N	2025-11-07 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Schwimmhalle-im-Schulzentrum-ab-Montag-wieder-in-Betrieb.php?object=tx,3165.5.1&ModID=7&FID=3165.3481.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.271764
news_1764675033268_7fh5g7hfv	tenant_hornbadmeinberg_001	Notmaßnahme und Sperrung am Holzhauser Berg	Notmaßnahme und Sperrung am Holzhauser Berg	Notmaßnahme und Sperrung am Holzhauser Berg	https://www.horn-badmeinberg.de/media/custom/3165_434_1_m.JPG?1763050937	\N	2025-11-13 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Notma%C3%9Fnahme-und-Sperrung-am-Holzhauser-Berg.php?object=tx,3165.5.1&ModID=7&FID=3165.3482.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.26886
news_1764675033270_2dd3xx69f	tenant_hornbadmeinberg_001	Stadtwerke Horn-Bad Meinberg versenden Ablesekarten für Wasserzählerstände 2025	Stadtwerke Horn-Bad Meinberg versenden Ablesekarten für Wasserzählerstände 2025	Stadtwerke Horn-Bad Meinberg versenden Ablesekarten für Wasserzählerstände 2025	https://www.horn-badmeinberg.de/media/custom/449_3235_1_m.JPG?1604573716	\N	2025-11-12 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Stadtwerke-Horn-Bad-Meinberg-versenden-Ablesekarten-f%C3%BCr-Wasserz%C3%A4hlerst%C3%A4nde-2025.php?object=tx,3165.5.1&ModID=7&FID=3165.3477.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.270728
news_1764675033272_lmv8ene7u	tenant_hornbadmeinberg_001	Baustelle an der Steinheimer Straße noch bis 21. November	Baustelle an der Steinheimer Straße noch bis 21. November	Baustelle an der Steinheimer Straße noch bis 21. November	https://www.horn-badmeinberg.de/media/custom/449_1476_1_m.JPG?1581502333	\N	2025-11-07 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Baustelle-an-der-Steinheimer-Stra%C3%9Fe-noch-bis-21-November.php?object=tx,3165.5.1&ModID=7&FID=3165.3476.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.272687
news_1764675033273_vlgyr0bmg	tenant_hornbadmeinberg_001	Stadt Horn-Bad Meinberg lädt zur Seniorenweihnachtsfeier ein	MAXIMALE ANMELDEZAHL ERREICHT	MAXIMALE ANMELDEZAHL ERREICHT	https://www.horn-badmeinberg.de/media/custom/449_1476_1_m.JPG?1581502333	\N	2025-11-06 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Stadt-Horn-Bad-Meinberg-l%C3%A4dt-zur-Seniorenweihnachtsfeier-ein.php?object=tx,3165.5.1&ModID=7&FID=3165.3480.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.273603
news_1764675033274_v3ztnnhhr	tenant_hornbadmeinberg_001	Erster Verdachtsfall von Geflügelpest in Lippe	Erster Verdachtsfall von Geflßgelpest in Lippe	Erster Verdachtsfall von Geflßgelpest in Lippe	https://www.horn-badmeinberg.de/media/custom/3165_238_1_m.GIF?1737716459	\N	2025-11-05 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Erster-Verdachtsfall-von-Gefl%C3%BCgelpest-in-Lippe.php?object=tx,3165.5.1&ModID=7&FID=3165.3478.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.274491
news_1764675033275_a01mct6ew	tenant_hornbadmeinberg_001	Neuer Ratgeber gibt Orientierung in unsicheren Zeiten	Neuer Ratgeber gibt Orientierung in unsicheren Zeiten	Neuer Ratgeber gibt Orientierung in unsicheren Zeiten	https://www.horn-badmeinberg.de/media/custom/3165_429_1_m.JPG?1762162699	\N	2025-11-03 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Neuer-Ratgeber-gibt-Orientierung-in-unsicheren-Zeiten.php?object=tx,3165.5.1&ModID=7&FID=3165.3474.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.276121
news_1764675033265_m93fwd4b1	tenant_hornbadmeinberg_001	Stadt Horn-Bad Meinberg sucht engagierte Mitglieder für Beeinträchtigen- und Seniorenbeirat sowie Integrationsbeirat	Stadt Horn-Bad Meinberg sucht engagierte Mitglieder für Beeinträchtigen- und Seniorenbeirat sowie Integrationsbeirat	Stadt Horn-Bad Meinberg sucht engagierte Mitglieder für Beeinträchtigen- und Seniorenbeirat sowie Integrationsbeirat	https://www.horn-badmeinberg.de/media/custom/449_1476_1_m.JPG?1581502333	\N	2025-11-25 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Stadt-Horn-Bad-Meinberg-sucht-engagierte-Mitglieder-f%C3%BCr-Beeintr%C3%A4chtigen-und-Seniorenbeirat-sowie-Integrationsbeirat.php?object=tx,3165.5.1&ModID=7&FID=3165.3489.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.26564
news_1764675033275_sthipn8df	tenant_hornbadmeinberg_001	Mit Eseln durch den Winter: LTM lädt zu Erlebnisführungen mit Camillo und Co.	Mit Eseln durch den Winter: LTM lßdt zu Erlebnisfßhrungen mit Camillo und Co.	Mit Eseln durch den Winter: LTM lßdt zu Erlebnisfßhrungen mit Camillo und Co.	https://www.horn-badmeinberg.de/media/custom/3165_430_1_m.JPG?1762248112	\N	2025-11-04 00:00:00	https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/Mit-Eseln-durch-den-Winter-LTM-l%C3%A4dt-zu-Erlebnisf%C3%BChrungen-mit-Camillo-und-Co-.php?object=tx,3165.5.1&ModID=7&FID=3165.3475.1&NavID=3165.47&La=1&kat=8.51%2C390.4&call=suche	2025-12-02 06:30:33.275365
\.


--
-- Data for Name: pois; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pois (id, "tenantId", name, description, category, latitude, longitude, address, "imageUrl", "websiteUrl", "openingHours", pricing, "createdAt") FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, slug, domain, "primaryColor", "secondaryColor", "logoUrl", "heroImageUrl", "contactEmail", "contactPhone", "contactAddress", "weatherLat", "weatherLon", "weatherCity", "chatbotName", "chatbotSystemPrompt", "enabledFeatures", "isActive", "createdAt", "updatedAt", mayor_name, mayor_email, mayor_phone, mayor_address, mayor_office_hours, "imprintUrl", "privacyUrl") FROM stdin;
tenant_barntrup_001	Barntrup	barntrup	barntrup.buergerapp.eu	#A51890	#E30074	/assets/logo-barntrup.png	/assets/hero-barntrup.webp	info@barntrup.de	05263 409-0	Mittelstraße 38, 32683 Barntrup	51.9833	9.1167	\N	Barntrupbot	Du bist Barntrupbot, der freundliche Chatbot für Barntrup. Du hilfst Bürgern bei Fragen zur Stadt, Veranstaltungen, Ämtern und Services.	\N	t	2025-11-22 04:18:35.111595	2025-11-22 04:18:35.111595	\N	\N	\N	\N	\N	\N	\N
tenant_schieder_001	Schieder-Schwalenberg	schieder	schieder.buergerapp.eu	#0066CC	#00A86B	/assets/logo-schieder.png	/assets/hero-schieder.jpg	info@schieder-schwalenberg.de	05282 / 601-0	Domäne 3, 32816 Schieder-Schwalenberg	51.8667	9.1167	\N	Schwalenbot	Du bist Schwalenbot, der freundliche Chatbot für Schieder-Schwalenberg. Du hilfst Bürgern bei Fragen zur Stadt, Veranstaltungen, Ämtern und Services.	\N	t	2025-11-22 04:18:35.111595	2025-11-22 04:18:35.111595	Marco Müllers	m.muellers@schieder-schwalenberg.de	05282 / 601-11	Domäne 3, 32816 Schieder-Schwalenberg	Nach Vereinbarung	\N	\N
tenant_hornbadmeinberg_001	Horn-Bad Meinberg	hornbadmeinberg	hornbadmeinberg.buergerapp.de	#1e40af	#3b82f6	/assets/hornbadmeinberg/logo.jpg	/assets/hornbadmeinberg/hero.png	post@horn-badmeinberg.de	05234 / 201 - 0	Marktplatz 4, 32805 Horn-Bad Meinberg	\N	\N	Horn-Bad Meinberg	Horn-Bad Meinberg Assistent	\N	\N	t	2025-12-02 05:51:41.14087	2025-12-02 05:51:41.14087	Michael Ruttner	\N	\N	\N	Mo: 8:30-12:00 & 14:00-16:00, Di: 8:30-12:00, Mi: 7:30-12:30, Do: 8:30-12:00 & 14:00-17:30, Fr: 8:30-12:00	https://www.horn-badmeinberg.de/Rechtliches/Impressum/	https://www.horn-badmeinberg.de/Rechtliches/Datenschutz/
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, "tenantId", name, email, "loginMethod", role, "oneSignalPlayerId", "pushEnabled", "createdAt", "lastSignedIn") FROM stdin;
\.


--
-- Data for Name: waste_areas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.waste_areas (id, tenant_id, name, created_at) FROM stdin;
1	tenant_schieder_001	Lothe	2025-11-23 06:09:29.791882
2	tenant_schieder_001	Schwalenberg	2025-11-23 06:09:29.793324
3	tenant_schieder_001	Brakelsiek	2025-11-23 06:09:29.79398
5	tenant_schieder_001	Glashütte/Siekholz	2025-11-23 06:09:29.795492
4	tenant_schieder_001	Wöbbel	2025-11-23 06:09:29.79474
6	tenant_schieder_001	Schieder	2025-11-24 08:31:33.770627
\.


--
-- Data for Name: waste_collections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.waste_collections (id, tenant_id, area_id, waste_type_id, collection_date, created_at) FROM stdin;
1220	tenant_schieder_001	3	3	2025-11-04	2025-11-24 09:10:05.961782
1221	tenant_schieder_001	3	3	2025-11-11	2025-11-24 09:10:05.963667
1222	tenant_schieder_001	3	3	2025-11-18	2025-11-24 09:10:05.964388
1223	tenant_schieder_001	3	3	2025-11-25	2025-11-24 09:10:05.965199
1224	tenant_schieder_001	3	3	2025-12-09	2025-11-24 09:10:05.965931
1225	tenant_schieder_001	3	3	2025-12-16	2025-11-24 09:10:05.96673
1226	tenant_schieder_001	3	3	2025-12-23	2025-11-24 09:10:05.967631
1227	tenant_schieder_001	3	3	2025-12-30	2025-11-24 09:10:05.96823
1228	tenant_schieder_001	3	4	2025-11-04	2025-11-24 09:10:05.96865
1229	tenant_schieder_001	3	4	2025-11-18	2025-11-24 09:10:05.969033
1230	tenant_schieder_001	3	4	2025-12-02	2025-11-24 09:10:05.969416
1231	tenant_schieder_001	3	4	2025-12-16	2025-11-24 09:10:05.969797
1232	tenant_schieder_001	3	4	2025-12-30	2025-11-24 09:10:05.970307
1233	tenant_schieder_001	3	5	2025-11-03	2025-11-24 09:10:05.970715
1234	tenant_schieder_001	3	5	2025-11-10	2025-11-24 09:10:05.971098
1235	tenant_schieder_001	3	5	2025-11-17	2025-11-24 09:10:05.971474
1236	tenant_schieder_001	3	5	2025-11-26	2025-11-24 09:10:05.971839
1237	tenant_schieder_001	3	5	2025-12-22	2025-11-24 09:10:05.972211
1238	tenant_schieder_001	3	5	2025-12-23	2025-11-24 09:10:05.973642
1239	tenant_schieder_001	3	1	2025-11-04	2025-11-24 09:10:05.974294
1240	tenant_schieder_001	3	1	2025-11-11	2025-11-24 09:10:05.97487
1241	tenant_schieder_001	3	1	2025-11-18	2025-11-24 09:10:05.975363
1242	tenant_schieder_001	3	1	2025-11-25	2025-11-24 09:10:05.975866
1243	tenant_schieder_001	3	1	2025-12-09	2025-11-24 09:10:05.97631
1244	tenant_schieder_001	3	1	2025-12-16	2025-11-24 09:10:05.976698
1245	tenant_schieder_001	3	1	2025-12-22	2025-11-24 09:10:05.977153
1246	tenant_schieder_001	3	1	2025-12-23	2025-11-24 09:10:05.977624
1247	tenant_schieder_001	3	1	2025-12-30	2025-11-24 09:10:05.978044
1248	tenant_schieder_001	5	3	2025-11-04	2025-11-24 09:10:05.978442
1249	tenant_schieder_001	5	3	2025-11-11	2025-11-24 09:10:05.978787
1250	tenant_schieder_001	5	3	2025-11-18	2025-11-24 09:10:05.979122
1251	tenant_schieder_001	5	3	2025-11-25	2025-11-24 09:10:05.979471
1252	tenant_schieder_001	5	3	2025-12-09	2025-11-24 09:10:05.979826
1253	tenant_schieder_001	5	3	2025-12-16	2025-11-24 09:10:05.980171
1254	tenant_schieder_001	5	3	2025-12-23	2025-11-24 09:10:05.980668
1255	tenant_schieder_001	5	3	2025-12-30	2025-11-24 09:10:05.981007
1256	tenant_schieder_001	5	4	2025-11-04	2025-11-24 09:10:05.981408
1257	tenant_schieder_001	5	4	2025-11-18	2025-11-24 09:10:05.981934
1258	tenant_schieder_001	5	4	2025-12-02	2025-11-24 09:10:05.982313
1259	tenant_schieder_001	5	4	2025-12-16	2025-11-24 09:10:05.982675
1260	tenant_schieder_001	5	4	2025-12-30	2025-11-24 09:10:05.983001
1261	tenant_schieder_001	5	5	2025-11-03	2025-11-24 09:10:05.983362
1262	tenant_schieder_001	5	5	2025-11-10	2025-11-24 09:10:05.983686
1263	tenant_schieder_001	5	5	2025-11-17	2025-11-24 09:10:05.984012
1264	tenant_schieder_001	5	5	2025-11-26	2025-11-24 09:10:05.984347
1265	tenant_schieder_001	5	5	2025-12-22	2025-11-24 09:10:05.984673
1266	tenant_schieder_001	5	5	2025-12-23	2025-11-24 09:10:05.985042
1267	tenant_schieder_001	5	1	2025-11-04	2025-11-24 09:10:05.9854
1268	tenant_schieder_001	5	1	2025-11-11	2025-11-24 09:10:05.985735
1269	tenant_schieder_001	5	1	2025-11-18	2025-11-24 09:10:05.986138
1270	tenant_schieder_001	5	1	2025-11-25	2025-11-24 09:10:05.986514
1271	tenant_schieder_001	5	1	2025-12-09	2025-11-24 09:10:05.986852
1272	tenant_schieder_001	5	1	2025-12-16	2025-11-24 09:10:05.987212
1273	tenant_schieder_001	5	1	2025-12-22	2025-11-24 09:10:05.98758
1274	tenant_schieder_001	5	1	2025-12-23	2025-11-24 09:10:05.987927
1275	tenant_schieder_001	5	1	2025-12-30	2025-11-24 09:10:05.988342
1276	tenant_schieder_001	1	3	2025-11-04	2025-11-24 09:10:05.988747
1277	tenant_schieder_001	1	3	2025-11-11	2025-11-24 09:10:05.989116
1278	tenant_schieder_001	1	3	2025-11-18	2025-11-24 09:10:05.989638
1279	tenant_schieder_001	1	3	2025-11-25	2025-11-24 09:10:05.990062
1280	tenant_schieder_001	1	3	2025-12-09	2025-11-24 09:10:05.990693
1281	tenant_schieder_001	1	3	2025-12-16	2025-11-24 09:10:05.991151
1282	tenant_schieder_001	1	3	2025-12-23	2025-11-24 09:10:05.991676
1283	tenant_schieder_001	1	3	2025-12-30	2025-11-24 09:10:05.992133
1284	tenant_schieder_001	1	4	2025-11-04	2025-11-24 09:10:05.992753
1285	tenant_schieder_001	1	4	2025-11-18	2025-11-24 09:10:05.993204
1286	tenant_schieder_001	1	4	2025-12-02	2025-11-24 09:10:05.993608
1287	tenant_schieder_001	1	4	2025-12-16	2025-11-24 09:10:05.99403
1288	tenant_schieder_001	1	4	2025-12-30	2025-11-24 09:10:05.994443
1289	tenant_schieder_001	1	5	2025-11-03	2025-11-24 09:10:05.994834
1290	tenant_schieder_001	1	5	2025-11-10	2025-11-24 09:10:05.995267
1291	tenant_schieder_001	1	5	2025-11-17	2025-11-24 09:10:05.995731
1292	tenant_schieder_001	1	5	2025-11-26	2025-11-24 09:10:05.99615
1293	tenant_schieder_001	1	5	2025-12-22	2025-11-24 09:10:05.996542
1294	tenant_schieder_001	1	5	2025-12-23	2025-11-24 09:10:05.996893
1295	tenant_schieder_001	1	1	2025-11-04	2025-11-24 09:10:05.997247
1296	tenant_schieder_001	1	1	2025-11-11	2025-11-24 09:10:05.997611
1297	tenant_schieder_001	1	1	2025-11-18	2025-11-24 09:10:05.997975
1298	tenant_schieder_001	1	1	2025-11-25	2025-11-24 09:10:05.998352
1299	tenant_schieder_001	1	1	2025-12-09	2025-11-24 09:10:05.998719
1300	tenant_schieder_001	1	1	2025-12-16	2025-11-24 09:10:05.999079
1301	tenant_schieder_001	1	1	2025-12-22	2025-11-24 09:10:05.999431
1302	tenant_schieder_001	1	1	2025-12-23	2025-11-24 09:10:05.999816
1303	tenant_schieder_001	1	1	2025-12-30	2025-11-24 09:10:06.000248
1304	tenant_schieder_001	6	3	2025-11-04	2025-11-24 09:10:06.000589
1305	tenant_schieder_001	6	3	2025-11-11	2025-11-24 09:10:06.00093
1306	tenant_schieder_001	6	3	2025-11-18	2025-11-24 09:10:06.001283
1307	tenant_schieder_001	6	3	2025-11-25	2025-11-24 09:10:06.001622
1308	tenant_schieder_001	6	3	2025-12-09	2025-11-24 09:10:06.001988
1309	tenant_schieder_001	6	3	2025-12-16	2025-11-24 09:10:06.002353
1310	tenant_schieder_001	6	3	2025-12-23	2025-11-24 09:10:06.0029
1311	tenant_schieder_001	6	3	2025-12-30	2025-11-24 09:10:06.003297
1312	tenant_schieder_001	6	4	2025-11-04	2025-11-24 09:10:06.003665
1313	tenant_schieder_001	6	4	2025-11-18	2025-11-24 09:10:06.004152
1314	tenant_schieder_001	6	4	2025-12-02	2025-11-24 09:10:06.004567
1315	tenant_schieder_001	6	4	2025-12-16	2025-11-24 09:10:06.004916
1316	tenant_schieder_001	6	4	2025-12-30	2025-11-24 09:10:06.005329
1317	tenant_schieder_001	6	5	2025-11-03	2025-11-24 09:10:06.005809
1318	tenant_schieder_001	6	5	2025-11-10	2025-11-24 09:10:06.006349
1319	tenant_schieder_001	6	5	2025-11-17	2025-11-24 09:10:06.00683
1320	tenant_schieder_001	6	5	2025-11-26	2025-11-24 09:10:06.007328
1321	tenant_schieder_001	6	5	2025-12-22	2025-11-24 09:10:06.007776
1322	tenant_schieder_001	6	5	2025-12-23	2025-11-24 09:10:06.008188
1323	tenant_schieder_001	6	1	2025-11-04	2025-11-24 09:10:06.00858
1324	tenant_schieder_001	6	1	2025-11-11	2025-11-24 09:10:06.008953
1325	tenant_schieder_001	6	1	2025-11-18	2025-11-24 09:10:06.00937
1326	tenant_schieder_001	6	1	2025-11-25	2025-11-24 09:10:06.009806
1327	tenant_schieder_001	6	1	2025-12-09	2025-11-24 09:10:06.010216
1328	tenant_schieder_001	6	1	2025-12-16	2025-11-24 09:10:06.010593
1329	tenant_schieder_001	6	1	2025-12-22	2025-11-24 09:10:06.01093
1330	tenant_schieder_001	6	1	2025-12-23	2025-11-24 09:10:06.011273
1331	tenant_schieder_001	6	1	2025-12-30	2025-11-24 09:10:06.011629
1332	tenant_schieder_001	2	3	2025-11-04	2025-11-24 09:10:06.01196
1333	tenant_schieder_001	2	3	2025-11-11	2025-11-24 09:10:06.012316
1334	tenant_schieder_001	2	3	2025-11-18	2025-11-24 09:10:06.012658
1335	tenant_schieder_001	2	3	2025-11-25	2025-11-24 09:10:06.012988
1336	tenant_schieder_001	2	3	2025-12-09	2025-11-24 09:10:06.013325
1337	tenant_schieder_001	2	3	2025-12-16	2025-11-24 09:10:06.013809
1338	tenant_schieder_001	2	3	2025-12-23	2025-11-24 09:10:06.014194
1339	tenant_schieder_001	2	3	2025-12-30	2025-11-24 09:10:06.014542
1340	tenant_schieder_001	2	4	2025-11-04	2025-11-24 09:10:06.014874
1341	tenant_schieder_001	2	4	2025-11-18	2025-11-24 09:10:06.015226
1342	tenant_schieder_001	2	4	2025-12-02	2025-11-24 09:10:06.015572
1343	tenant_schieder_001	2	4	2025-12-16	2025-11-24 09:10:06.015905
1344	tenant_schieder_001	2	4	2025-12-30	2025-11-24 09:10:06.016244
1345	tenant_schieder_001	2	5	2025-11-03	2025-11-24 09:10:06.016576
1346	tenant_schieder_001	2	5	2025-11-10	2025-11-24 09:10:06.016901
1347	tenant_schieder_001	2	5	2025-11-17	2025-11-24 09:10:06.017252
1348	tenant_schieder_001	2	5	2025-11-26	2025-11-24 09:10:06.017659
1349	tenant_schieder_001	2	5	2025-12-22	2025-11-24 09:10:06.018241
1350	tenant_schieder_001	2	5	2025-12-23	2025-11-24 09:10:06.0187
1351	tenant_schieder_001	2	1	2025-11-04	2025-11-24 09:10:06.01915
1352	tenant_schieder_001	2	1	2025-11-11	2025-11-24 09:10:06.019679
1353	tenant_schieder_001	2	1	2025-11-18	2025-11-24 09:10:06.020121
1354	tenant_schieder_001	2	1	2025-11-25	2025-11-24 09:10:06.021083
1355	tenant_schieder_001	2	1	2025-12-09	2025-11-24 09:10:06.021691
1356	tenant_schieder_001	2	1	2025-12-16	2025-11-24 09:10:06.022232
1357	tenant_schieder_001	2	1	2025-12-22	2025-11-24 09:10:06.02263
1358	tenant_schieder_001	2	1	2025-12-23	2025-11-24 09:10:06.023017
1359	tenant_schieder_001	2	1	2025-12-30	2025-11-24 09:10:06.023442
1360	tenant_schieder_001	4	3	2025-11-04	2025-11-24 09:10:06.024015
1361	tenant_schieder_001	4	3	2025-11-11	2025-11-24 09:10:06.024531
1362	tenant_schieder_001	4	3	2025-11-18	2025-11-24 09:10:06.025002
1363	tenant_schieder_001	4	3	2025-11-25	2025-11-24 09:10:06.025476
1364	tenant_schieder_001	4	3	2025-12-09	2025-11-24 09:10:06.025956
1365	tenant_schieder_001	4	3	2025-12-16	2025-11-24 09:10:06.026446
1366	tenant_schieder_001	4	3	2025-12-23	2025-11-24 09:10:06.02686
1367	tenant_schieder_001	4	3	2025-12-30	2025-11-24 09:10:06.02729
1368	tenant_schieder_001	4	4	2025-11-04	2025-11-24 09:10:06.027736
1369	tenant_schieder_001	4	4	2025-11-18	2025-11-24 09:10:06.028167
1370	tenant_schieder_001	4	4	2025-12-02	2025-11-24 09:10:06.028618
1371	tenant_schieder_001	4	4	2025-12-16	2025-11-24 09:10:06.029505
1372	tenant_schieder_001	4	4	2025-12-30	2025-11-24 09:10:06.030063
1373	tenant_schieder_001	4	5	2025-11-03	2025-11-24 09:10:06.030759
1374	tenant_schieder_001	4	5	2025-11-10	2025-11-24 09:10:06.031243
1375	tenant_schieder_001	4	5	2025-11-17	2025-11-24 09:10:06.031674
1376	tenant_schieder_001	4	5	2025-11-26	2025-11-24 09:10:06.032043
1377	tenant_schieder_001	4	5	2025-12-22	2025-11-24 09:10:06.032396
1378	tenant_schieder_001	4	5	2025-12-23	2025-11-24 09:10:06.032745
1379	tenant_schieder_001	4	1	2025-11-04	2025-11-24 09:10:06.033085
1380	tenant_schieder_001	4	1	2025-11-11	2025-11-24 09:10:06.033432
1381	tenant_schieder_001	4	1	2025-11-18	2025-11-24 09:10:06.033763
1382	tenant_schieder_001	4	1	2025-11-25	2025-11-24 09:10:06.03411
1383	tenant_schieder_001	4	1	2025-12-09	2025-11-24 09:10:06.03446
1384	tenant_schieder_001	4	1	2025-12-16	2025-11-24 09:10:06.034777
1385	tenant_schieder_001	4	1	2025-12-22	2025-11-24 09:10:06.035086
1386	tenant_schieder_001	4	1	2025-12-23	2025-11-24 09:10:06.035533
1387	tenant_schieder_001	4	1	2025-12-30	2025-11-24 09:10:06.035877
1388	tenant_schieder_001	2	2	2025-11-07	2025-11-24 09:10:06.036588
1389	tenant_schieder_001	2	2	2025-12-05	2025-11-24 09:10:06.037041
1390	tenant_schieder_001	3	2	2025-11-15	2025-11-24 09:10:06.037769
1391	tenant_schieder_001	4	2	2025-11-11	2025-11-24 09:10:06.038302
1392	tenant_schieder_001	4	2	2025-11-22	2025-11-24 09:10:06.038732
1393	tenant_schieder_001	5	2	2025-11-29	2025-11-24 09:10:06.039182
\.


--
-- Data for Name: waste_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.waste_types (id, name, color, icon, description) FROM stdin;
1	Biotonne	green	Leaf	Grüne Biotonne für organische Abfälle
2	Saisonbiotonne	green	Flower	Grüne Saisontonne für Gartenabfälle
4	Altpapiertonne	blue	FileText	Blaue Altpapiertonne
5	Gelbe Tonne	yellow	Package	Gelbe Tonne für Verpackungen
3	Restmülltonne	black	Trash2	Graue Restmülltonne
\.


--
-- Name: attractions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attractions_id_seq', 70, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clubs_id_seq', 352, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 33, true);


--
-- Name: education_facilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.education_facilities_id_seq', 10, true);


--
-- Name: education_institutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.education_institutions_id_seq', 5, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 23, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 29, true);


--
-- Name: waste_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.waste_areas_id_seq', 6, true);


--
-- Name: waste_collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.waste_collections_id_seq', 1393, true);


--
-- Name: waste_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.waste_types_id_seq', 5, true);


--
-- Name: attractions attractions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attractions
    ADD CONSTRAINT attractions_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: education_facilities education_facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_facilities
    ADD CONSTRAINT education_facilities_pkey PRIMARY KEY (id);


--
-- Name: education_facilities education_facilities_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_facilities
    ADD CONSTRAINT education_facilities_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: education_institutions education_institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_institutions
    ADD CONSTRAINT education_institutions_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_tenant_id_name_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_name_phone_key UNIQUE (tenant_id, name, phone);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_tenant_id_source_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_source_url_key UNIQUE (tenant_id, source_url);


--
-- Name: help_conversations help_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_conversations
    ADD CONSTRAINT help_conversations_pkey PRIMARY KEY (id);


--
-- Name: help_messages help_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_messages
    ADD CONSTRAINT help_messages_pkey PRIMARY KEY (id);


--
-- Name: help_offers help_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_offers
    ADD CONSTRAINT help_offers_pkey PRIMARY KEY (id);


--
-- Name: help_requests help_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_requests
    ADD CONSTRAINT help_requests_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: pois pois_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pois
    ADD CONSTRAINT pois_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: waste_areas waste_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_areas
    ADD CONSTRAINT waste_areas_pkey PRIMARY KEY (id);


--
-- Name: waste_areas waste_areas_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_areas
    ADD CONSTRAINT waste_areas_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: waste_collections waste_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections
    ADD CONSTRAINT waste_collections_pkey PRIMARY KEY (id);


--
-- Name: waste_collections waste_collections_tenant_id_area_id_waste_type_id_collectio_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections
    ADD CONSTRAINT waste_collections_tenant_id_area_id_waste_type_id_collectio_key UNIQUE (tenant_id, area_id, waste_type_id, collection_date);


--
-- Name: waste_types waste_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_types
    ADD CONSTRAINT waste_types_name_key UNIQUE (name);


--
-- Name: waste_types waste_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_types
    ADD CONSTRAINT waste_types_pkey PRIMARY KEY (id);


--
-- Name: idx_attractions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attractions_category ON public.attractions USING btree (category);


--
-- Name: idx_attractions_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attractions_display_order ON public.attractions USING btree (display_order);


--
-- Name: idx_attractions_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attractions_tenant ON public.attractions USING btree (tenant_id);


--
-- Name: idx_clubs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clubs_category ON public.clubs USING btree (category_id);


--
-- Name: idx_clubs_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clubs_tenant ON public.clubs USING btree (tenant_id);


--
-- Name: idx_conversations_helper; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_helper ON public.help_conversations USING btree (helper_id);


--
-- Name: idx_conversations_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_requester ON public.help_conversations USING btree (requester_id);


--
-- Name: idx_conversations_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_tenant ON public.help_conversations USING btree (tenant_id);


--
-- Name: idx_departments_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_tenant ON public.departments USING btree (tenant_id, display_order);


--
-- Name: idx_education_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_education_category ON public.education_institutions USING btree (category);


--
-- Name: idx_education_facilities_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_education_facilities_category ON public.education_facilities USING btree (category_id);


--
-- Name: idx_education_facilities_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_education_facilities_tenant ON public.education_facilities USING btree (tenant_id);


--
-- Name: idx_education_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_education_tenant ON public.education_institutions USING btree (tenant_id);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department_id);


--
-- Name: idx_employees_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_name ON public.employees USING btree (tenant_id, name);


--
-- Name: idx_employees_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_tenant ON public.employees USING btree (tenant_id);


--
-- Name: idx_events_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_date_range ON public.events USING btree (start_date, end_date);


--
-- Name: idx_events_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_location ON public.events USING btree (tenant_id, location);


--
-- Name: idx_events_tenant_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_tenant_date ON public.events USING btree (tenant_id, start_date DESC);


--
-- Name: idx_help_offers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_offers_status ON public.help_offers USING btree (status);


--
-- Name: idx_help_offers_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_offers_tenant ON public.help_offers USING btree (tenant_id);


--
-- Name: idx_help_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_requests_status ON public.help_requests USING btree (status);


--
-- Name: idx_help_requests_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_requests_tenant ON public.help_requests USING btree (tenant_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.help_messages USING btree (conversation_id);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.help_messages USING btree (sender_id);


--
-- Name: idx_waste_collections_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waste_collections_area ON public.waste_collections USING btree (area_id, collection_date);


--
-- Name: idx_waste_collections_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waste_collections_date ON public.waste_collections USING btree (collection_date);


--
-- Name: idx_waste_collections_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waste_collections_tenant ON public.waste_collections USING btree (tenant_id);


--
-- Name: clubs clubs_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.club_categories(id) ON DELETE CASCADE;


--
-- Name: clubs clubs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: departments departments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: education_facilities education_facilities_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_facilities
    ADD CONSTRAINT education_facilities_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.education_categories(id) ON DELETE CASCADE;


--
-- Name: education_institutions education_institutions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education_institutions
    ADD CONSTRAINT education_institutions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: employees employees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: events events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: attractions fk_attractions_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attractions
    ADD CONSTRAINT fk_attractions_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: help_messages help_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_messages
    ADD CONSTRAINT help_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.help_conversations(id) ON DELETE CASCADE;


--
-- Name: news news_tenantId_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT "news_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pois pois_tenantId_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pois
    ADD CONSTRAINT "pois_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: users users_tenantId_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: waste_areas waste_areas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_areas
    ADD CONSTRAINT waste_areas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: waste_collections waste_collections_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections
    ADD CONSTRAINT waste_collections_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.waste_areas(id) ON DELETE CASCADE;


--
-- Name: waste_collections waste_collections_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections
    ADD CONSTRAINT waste_collections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: waste_collections waste_collections_waste_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waste_collections
    ADD CONSTRAINT waste_collections_waste_type_id_fkey FOREIGN KEY (waste_type_id) REFERENCES public.waste_types(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bGM0D9z4h67n0v1R1jcCfhWI1lHgt93aO2EawTqsJTAAX7td50elLH0n4ayk8ne

