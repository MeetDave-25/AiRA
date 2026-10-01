"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import WriteIntro from "@/components/home/WriteIntro";
import Hero from "./Hero";
import Deck from "./Deck";
import Tickers from "./Tickers";
import Metro from "./Metro";
import WorkStrip, { toWorkItems } from "./WorkStrip";
import Ticket from "./Ticket";
import MevyLight from "./MevyLight";

/**
 * Homepage — a guided tour of the lab, narrated by Mevy (our AI guide), in a neo-brutal style:
 * access-pass hero → frontier deck → live ticker → the AiRA metro line → shipped work → your ticket in.
 */
export default function LabHome() {
    const [ready, setReady] = useState(false);
    const [replayIntro, setReplayIntro] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [stats, setStats] = useState({ events: 0, members: 0, participants: 0 });
    const [loading, setLoading] = useState(true);

    const onIntroDone = useCallback(() => {
        setReady(true);
        setReplayIntro(false);
    }, []);

    useEffect(() => {
        const json = (r: Response) => (r.ok ? r.json() : null);
        Promise.all([
            fetch("/api/events").then(json).catch(() => null),
            fetch("/api/projects").then(json).catch(() => null),
            fetch("/api/public/stats").then(json).catch(() => null),
        ]).then(([ev, pr, st]) => {
            setEvents(Array.isArray(ev) ? ev.slice(0, 4) : []);
            const list = Array.isArray(pr) ? pr : pr?.projects || [];
            setProjects(Array.isArray(list) ? list : []);
            if (st) setStats({ events: Number(st.events) || 0, members: Number(st.members) || 0, participants: Number(st.participants) || 0 });
            setLoading(false);
        });
    }, []);

    const work = useMemo(() => toWorkItems(events, projects), [events, projects]);

    return (
        <div className="relative bg-nb-paper text-nb-ink overflow-x-clip">
            <WriteIntro onComplete={onIntroDone} forceShow={replayIntro} />
            <Hero ready={ready} onReplayIntro={() => setReplayIntro(true)} stats={{ members: stats.members, projects: projects.length }} />
            <Deck />
            <Tickers stats={stats} projects={projects.length} loading={loading} />
            <MevyLight />
            <Metro />
            <WorkStrip items={work} />
            <Ticket />
        </div>
    );
}
