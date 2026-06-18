// Lightweight inline SVG icons (no dependency). Each accepts size & props.
const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const ShieldCheck = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Check = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);

export const X = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const AlertTriangle = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const Search = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export const Plus = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>
);

export const Download = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const LogOut = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

export const FileText = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

export const Users = ({ size = 20, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const ArrowLeft = ({ size = 18, ...p }) => (
  <svg {...base(size)} {...p}><path d="m12 19-7-7 7-7M19 12H5" /></svg>
);
