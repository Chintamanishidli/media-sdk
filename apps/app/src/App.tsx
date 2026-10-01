import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MediaProvider, createMockProvider, useMediaActions, useMediaEvents, useMediaSearch,
  type MediaClientConfig, type MediaItem, type MediaType,
} from "media-react";
import { reelContainerStyle, reelItemStyle, useGrid, useLightbox, useReelSwiper } from "media-ui-react";

// The app is the only place that wires data (media-react) to display (media-ui-react).
const KEY = import.meta.env.VITE_PEXELS_KEY as string | undefined;
const config: MediaClientConfig = KEY ? { apiKey: KEY } : { provider: createMockProvider() };

export function App() {
  return (
    <MediaProvider config={config}>
      <Explorer />
    </MediaProvider>
  );
}

function Explorer() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("photo");
  const [open, setOpen] = useState<number | null>(null);
  const feed = useMediaSearch({ query, type });

  useEffect(() => setOpen(null), [query, type]);

  const grid = useGrid<MediaItem>({
    items: feed.items,
    hasMore: feed.hasMore,
    isLoadingMore: feed.isLoadingMore,
    onLoadMore: feed.loadMore,
    onSelect: (_item, i) => setOpen(i),
    getLabel: (item) => item.title,
  });

  const submit = (e: FormEvent) => { e.preventDefault(); setQuery(input.trim()); };

  return (
    <div className="page">
      <header className="bar">
        <h1>Media Explorer</h1>
        <form onSubmit={submit} role="search" className="search">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search e.g. ocean, forest…" aria-label="Search" />
          <button type="submit">Search</button>
        </form>
        <div className="tabs" role="tablist">
          {(["photo", "video"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={type === t} onClick={() => setType(t)}>
              {t === "photo" ? "Photos" : "Videos"}
            </button>
          ))}
        </div>
      </header>

      <main>
        <p className="muted">{query ? `Results for “${query}”` : "Trending"}{!KEY && " · offline mock data"}</p>

        {feed.isLoading && <p role="status">Loading…</p>}
        {feed.status === "error" && (
          <p role="alert">Could not load media ({feed.error?.code}). <button onClick={feed.retry}>Retry</button></p>
        )}
        {feed.status === "success" && feed.items.length === 0 && <p>No results.</p>}

        <div className="grid" {...grid.getContainerProps()}>
          {feed.items.map((item, i) => (
            <div key={item.id} className="cell" {...grid.getItemProps(item, i)}>
              <img src={item.thumbnailUrl} alt="" loading="lazy" style={{ aspectRatio: `${item.width} / ${item.height}` }} />
              {item.type === "video" && <span className="badge">▶ {item.durationSec}s</span>}
            </div>
          ))}
        </div>

        <div {...grid.getSentinelProps()} />
        {feed.isLoadingMore && <p role="status">Loading more…</p>}
        {feed.error && feed.items.length > 0 && <p role="alert">Couldn’t load more ({feed.error.code}).</p>}
        <button className="more" {...grid.getLoadMoreButtonProps()}>Load more</button>
      </main>

      {type === "photo" && (
        <PhotoLightbox items={feed.items} index={open} onChange={setOpen} onClose={() => setOpen(null)} />
      )}
      {type === "video" && open !== null && (
        <Reels
          items={feed.items} startIndex={open} hasMore={feed.hasMore}
          loadMore={feed.loadMore} onClose={() => setOpen(null)}
        />
      )}

      <ActivityLog />
    </div>
  );
}

function PhotoLightbox(props: { items: MediaItem[]; index: number | null; onChange: (i: number) => void; onClose: () => void }) {
  const { items, index, onChange, onClose } = props;
  const { trackView, trackDownload } = useMediaActions();
  const lb = useLightbox({ index, count: items.length, onIndexChange: onChange, onClose, label: "Photo viewer" });
  const item = index !== null ? items[index] : undefined;

  useEffect(() => { if (item) trackView(item); }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lb.isOpen || !item) return null;
  return (
    <div className="backdrop" {...lb.getBackdropProps()}>
      <div className="dialog" {...lb.getDialogProps()}>
        <img src={item.previewUrl} alt={item.title} />
        <div className="caption">
          <span>{item.title} · {item.author.name}</span>
          <a href={item.downloadUrl} target="_blank" rel="noreferrer" onClick={() => trackDownload(item)}>Download</a>
        </div>
        <button className="nav prev" {...lb.getPrevButtonProps()}>‹</button>
        <button className="nav next" {...lb.getNextButtonProps()}>›</button>
        <button className="close" {...lb.getCloseButtonProps()}>×</button>
      </div>
    </div>
  );
}

function Reels(props: { items: MediaItem[]; startIndex: number; hasMore: boolean; loadMore: () => void; onClose: () => void }) {
  const { items, startIndex, hasMore, loadMore, onClose } = props;
  const { trackView, trackDownload } = useMediaActions();
  const reel = useReelSwiper({
    count: items.length,
    initialIndex: startIndex,
    label: "Video reels",
    onActiveChange: (i) => {
      const it = items[i];
      if (it) trackView(it);
      if (hasMore && i >= items.length - 3) loadMore();
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="reels">
      <button className="close" aria-label="Close reels" onClick={onClose}>×</button>
      <div className="reel-scroll" style={reelContainerStyle} {...reel.getContainerProps()}>
        {items.map((item, i) => (
          <section key={item.id} className="reel" style={reelItemStyle} {...reel.getItemProps(i)}>
            <ReelVideo item={item} active={i === reel.activeIndex} />
            <div className="caption">
              <span>{item.title} · {item.author.name}</span>
              <a href={item.downloadUrl} target="_blank" rel="noreferrer" onClick={() => trackDownload(item)}>Download</a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ReelVideo({ item, active }: { item: MediaItem; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {}); // autoplay can be blocked; muted videos are normally allowed
    else v.pause();
  }, [active]);
  return <video ref={ref} src={item.videoUrl} poster={item.thumbnailUrl} muted loop playsInline preload="metadata" />;
}

/** Proves the app can subscribe to SDK events independently of the default console logger. */
function ActivityLog() {
  const [lines, setLines] = useState<string[]>([]);
  const push = (s: string) => setLines((l) => [s, ...l].slice(0, 5));
  useMediaEvents({
    view: (e) => push(`view · ${e.item.title}`),
    download: (e) => push(`download · ${e.item.title}`),
    error: (e) => push(`error · ${e.error.code}`),
  });
  return (
    <aside className="log" aria-label="Recent activity">
      <strong>Activity</strong>
      {lines.length === 0 ? <div>—</div> : lines.map((l, i) => <div key={i}>{l}</div>)}
    </aside>
  );
}
