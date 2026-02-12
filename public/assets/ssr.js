import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Link, router, Head, useForm, createInertiaApp } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, X, LayoutDashboard, Newspaper, Palette, Home as Home$1, LogOut, ChevronRight, ChevronLeft, Menu, User, FileText, Eye, Users, ArrowRight, Clock, ArrowLeft, Image, Upload, Save, Search, Plus, Edit, Trash2, Type, MapPin, Share2, Shield, Mail, Lock, EyeOff, MessageSquare, HelpCircle, Map, ChevronDown, Play, Calendar, BookOpen, UserCheck, ScrollText, MessageCircle, Scale, Send, Phone, Award, ExternalLink, FileCheck, Gavel, ClipboardList, Building2, Wallet, Receipt, GraduationCap, Users2, BarChart3, Download, Instagram, Heart, MessageSquareHeart, Facebook, Youtube } from "lucide-react";
import ReactDOMServer from "react-dom/server";
function FlashMessages() {
  const { flash } = usePage().props;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (flash == null ? void 0 : flash.success) {
      setMessage({ type: "success", text: flash.success });
      setVisible(true);
    } else if (flash == null ? void 0 : flash.error) {
      setMessage({ type: "error", text: flash.error });
      setVisible(true);
    }
  }, [flash]);
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 4e3);
      return () => clearTimeout(timer);
    }
  }, [visible]);
  if (!visible || !message) return null;
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`, children: [
    message.type === "success" ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-emerald-500" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-5 h-5 text-red-500" }),
    /* @__PURE__ */ jsx("span", { children: message.text }),
    /* @__PURE__ */ jsx("button", { onClick: () => setVisible(false), className: "ml-2 hover:opacity-70", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
  ] });
}
const navItems$1 = [
  { label: "Dashboard", href: "/painel", icon: LayoutDashboard },
  { label: "Notícias", href: "/painel/noticias", icon: Newspaper },
  { label: "Aparência", href: "/painel/aparencia", icon: Palette }
];
function AdminLayout({ children, title }) {
  var _a;
  const { auth } = usePage().props;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUrl = usePage().url;
  function isActive(href) {
    if (href === "/painel") return currentUrl === "/painel";
    return currentUrl.startsWith(href);
  }
  function handleLogout() {
    router.post("/logout");
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx(FlashMessages, {}),
    mobileOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 z-40 lg:hidden",
        onClick: () => setMobileOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: `fixed top-0 left-0 h-full z-50 bg-navy-dark text-white transition-all duration-300 flex flex-col ${collapsed ? "w-[72px]" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`, children: [
      /* @__PURE__ */ jsxs("div", { className: `flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? "justify-center" : "gap-3"}`, children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-gold font-serif font-bold text-lg", children: "C" }) }),
        !collapsed && /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: "Câmara de Sumé" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/50", children: "Painel Admin" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 py-4 px-3 space-y-1 overflow-y-auto", children: navItems$1.map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? "bg-gold/20 text-gold" : "text-white/70 hover:text-white hover:bg-white/10"} ${collapsed ? "justify-center" : ""}`,
          title: collapsed ? item.label : void 0,
          children: [
            /* @__PURE__ */ jsx(item.icon, { className: "w-5 h-5 flex-shrink-0" }),
            !collapsed && /* @__PURE__ */ jsx("span", { children: item.label })
          ]
        },
        item.href
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-white/10 p-3 space-y-2", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/",
            className: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? "justify-center" : ""}`,
            target: "_blank",
            children: [
              /* @__PURE__ */ jsx(Home$1, { className: "w-4 h-4 flex-shrink-0" }),
              !collapsed && /* @__PURE__ */ jsx("span", { children: "Ver Site" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLogout,
            className: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full ${collapsed ? "justify-center" : ""}`,
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 flex-shrink-0" }),
              !collapsed && /* @__PURE__ */ jsx("span", { children: "Sair" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCollapsed(!collapsed),
            className: "hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors",
            children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"}`, children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileOpen(true),
              className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600",
              children: /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800", children: title })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50", children: [
          /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-gray-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 hidden sm:inline", children: (_a = auth == null ? void 0 : auth.user) == null ? void 0 : _a.fullName })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "p-4 lg:p-6", children })
    ] })
  ] });
}
function Dashboard({ stats, recentNews }) {
  const cards = [
    { label: "Notícias Publicadas", value: stats.publishedNews, icon: Newspaper, color: "bg-emerald-500", href: "/painel/noticias?status=published" },
    { label: "Rascunhos", value: stats.draftNews, icon: FileText, color: "bg-amber-500", href: "/painel/noticias?status=draft" },
    { label: "Total de Notícias", value: stats.totalNews, icon: Eye, color: "bg-blue-500", href: "/painel/noticias" },
    { label: "Vereadores Ativos", value: stats.totalCouncilors, icon: Users, color: "bg-violet-500", href: "#" }
  ];
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Dashboard", children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard - Painel" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: cards.map((card) => /* @__PURE__ */ jsxs(
      Link,
      {
        href: card.href,
        className: "bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow group",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`, children: /* @__PURE__ */ jsx(card.icon, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-800", children: card.value }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: card.label })
        ]
      },
      card.label
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-gray-100 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-gray-800", children: "Últimas Notícias" }),
        /* @__PURE__ */ jsx(Link, { href: "/painel/noticias", className: "text-sm text-navy hover:underline", children: "Ver todas" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-50", children: [
        recentNews.length === 0 && /* @__PURE__ */ jsx("p", { className: "px-5 py-8 text-center text-gray-400 text-sm", children: "Nenhuma notícia cadastrada" }),
        recentNews.map((news) => /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/painel/noticias/${news.id}/editar`,
            className: "flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-800 truncate", children: news.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-gray-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: new Date(news.created_at).toLocaleDateString("pt-BR") }),
                  news.category && /* @__PURE__ */ jsx("span", { className: "text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full", children: news.category.name })
                ] })
              ] }),
              /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-1 rounded-full font-medium ml-3 ${news.status === "published" ? "bg-emerald-50 text-emerald-700" : news.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-500"}`, children: news.status === "published" ? "Publicada" : news.status === "draft" ? "Rascunho" : "Arquivada" })
            ]
          },
          news.id
        ))
      ] })
    ] })
  ] });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard
}, Symbol.toStringTag, { value: "Module" }));
function NewsForm({ news: existing, categories }) {
  var _a;
  const isEditing = !!existing;
  const { data, setData, processing } = useForm({
    title: (existing == null ? void 0 : existing.title) || "",
    excerpt: (existing == null ? void 0 : existing.excerpt) || "",
    content: (existing == null ? void 0 : existing.content) || "",
    status: (existing == null ? void 0 : existing.status) || "draft",
    category_id: ((_a = existing == null ? void 0 : existing.category_id) == null ? void 0 : _a.toString()) || "",
    cover_image: null
  });
  const [coverPreview, setCoverPreview] = useState((existing == null ? void 0 : existing.cover_image_url) || null);
  const fileRef = useRef(null);
  function handleCoverChange(file) {
    setData("cover_image", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a2;
        return setCoverPreview((_a2 = e.target) == null ? void 0 : _a2.result);
      };
      reader.readAsDataURL(file);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("excerpt", data.excerpt);
    formData.append("content", data.content);
    formData.append("status", data.status);
    formData.append("category_id", data.category_id);
    if (data.cover_image) {
      formData.append("cover_image", data.cover_image);
    }
    if (isEditing) {
      formData.append("_method", "PUT");
      router.post(`/painel/noticias/${existing.id}`, formData, {
        forceFormData: true
      });
    } else {
      router.post("/painel/noticias", formData, {
        forceFormData: true
      });
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: isEditing ? "Editar Notícia" : "Nova Notícia", children: [
    /* @__PURE__ */ jsx(Head, { title: `${isEditing ? "Editar" : "Nova"} Notícia - Painel` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/painel/noticias",
          className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Voltar para listagem"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-5 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Título" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.title,
                onChange: (e) => setData("title", e.target.value),
                className: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all",
                placeholder: "Título da notícia",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Resumo" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.excerpt,
                onChange: (e) => setData("excerpt", e.target.value),
                rows: 2,
                className: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all resize-none",
                placeholder: "Resumo curto da notícia (aparece na listagem)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Conteúdo" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.content,
                onChange: (e) => setData("content", e.target.value),
                rows: 15,
                className: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all font-mono",
                placeholder: "Conteúdo da notícia (HTML suportado)"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Suporta HTML. Em breve: editor visual." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Imagem de Capa" }),
            coverPreview ? /* @__PURE__ */ jsxs("div", { className: "relative rounded-lg overflow-hidden mb-3", children: [
              /* @__PURE__ */ jsx("img", { src: coverPreview, alt: "Preview", className: "w-full h-40 object-cover" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setCoverPreview(null);
                    setData("cover_image", null);
                  },
                  className: "absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }) : /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => {
                  var _a2;
                  return (_a2 = fileRef.current) == null ? void 0 : _a2.click();
                },
                className: "flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-navy/30 transition-colors mb-3",
                children: [
                  /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 text-gray-300 mb-2" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Clique para enviar" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300 mt-1", children: "JPG, PNG ou WebP até 5MB" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                accept: "image/jpeg,image/png,image/webp",
                className: "hidden",
                onChange: (e) => {
                  var _a2;
                  return handleCoverChange(((_a2 = e.target.files) == null ? void 0 : _a2[0]) || null);
                }
              }
            ),
            !coverPreview && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a2;
                  return (_a2 = fileRef.current) == null ? void 0 : _a2.click();
                },
                className: "w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                  "Selecionar imagem"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  className: "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 outline-none",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "draft", children: "Rascunho" }),
                    /* @__PURE__ */ jsx("option", { value: "published", children: "Publicada" }),
                    /* @__PURE__ */ jsx("option", { value: "archived", children: "Arquivada" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Categoria" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.category_id,
                  onChange: (e) => setData("category_id", e.target.value),
                  className: "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 outline-none",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Sem categoria" }),
                    categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/painel/noticias",
              className: "px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors disabled:opacity-50 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                processing ? "Salvando..." : isEditing ? "Atualizar" : "Criar Notícia"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewsForm
}, Symbol.toStringTag, { value: "Module" }));
function NewsIndex$1({ news, categories, filters }) {
  const [search, setSearch] = useState(filters.search);
  function applyFilters(overrides = {}) {
    const params = {
      status: filters.status,
      category: filters.category,
      search,
      ...overrides
    };
    const clean = {};
    for (const [k, v] of Object.entries(params)) {
      if (v) clean[k] = v;
    }
    router.get("/painel/noticias", clean, { preserveState: true });
  }
  function handleDelete(id, title) {
    if (confirm(`Excluir "${title}"?`)) {
      router.delete(`/painel/noticias/${id}`);
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Notícias", children: [
    /* @__PURE__ */ jsx(Head, { title: "Notícias - Painel" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 sm:w-72", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && applyFilters({ search }),
              placeholder: "Buscar notícias...",
              className: "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.status,
            onChange: (e) => applyFilters({ status: e.target.value }),
            className: "border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy/20 outline-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
              /* @__PURE__ */ jsx("option", { value: "published", children: "Publicadas" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Rascunhos" }),
              /* @__PURE__ */ jsx("option", { value: "archived", children: "Arquivadas" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.category,
            onChange: (e) => applyFilters({ category: e.target.value }),
            className: "border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy/20 outline-none hidden sm:block",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Categoria" }),
              categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/painel/noticias/criar",
          className: "flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors text-sm font-medium whitespace-nowrap",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Nova Notícia"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Título" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell", children: "Categoria" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell", children: "Data" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-50", children: [
          news.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-5 py-12 text-center text-gray-400 text-sm", children: "Nenhuma notícia encontrada" }) }),
          news.data.map((item) => {
            var _a;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50/50 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                item.cover_image_url && /* @__PURE__ */ jsx("img", { src: item.cover_image_url, alt: "", className: "w-10 h-10 rounded-lg object-cover hidden sm:block" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-800 truncate max-w-xs", children: item.title }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 hidden sm:block", children: (_a = item.author) == null ? void 0 : _a.full_name })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 hidden md:table-cell", children: item.category ? /* @__PURE__ */ jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full", children: item.category.name }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300", children: "—" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-1 rounded-full font-medium ${item.status === "published" ? "bg-emerald-50 text-emerald-700" : item.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`, children: item.status === "published" ? "Publicada" : item.status === "draft" ? "Rascunho" : "Arquivada" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 hidden sm:table-cell", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: new Date(item.published_at || item.created_at).toLocaleDateString("pt-BR") }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                item.status === "published" && /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/noticias/${item.slug}`,
                    target: "_blank",
                    className: "p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors",
                    title: "Ver no site",
                    children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/painel/noticias/${item.id}/editar`,
                    className: "p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-navy/5 transition-colors",
                    title: "Editar",
                    children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(item.id, item.title),
                    className: "p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors",
                    title: "Excluir",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ] }, item.id);
          })
        ] })
      ] }) }),
      news.meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-t border-gray-100", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
          news.meta.total,
          " notícia",
          news.meta.total !== 1 ? "s" : "",
          " • Página ",
          news.meta.current_page,
          " de ",
          news.meta.last_page
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          news.meta.current_page > 1 && /* @__PURE__ */ jsx(
            Link,
            {
              href: `/painel/noticias?page=${news.meta.current_page - 1}`,
              className: "p-2 rounded-lg hover:bg-gray-100 text-gray-500",
              preserveState: true,
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
            }
          ),
          news.meta.current_page < news.meta.last_page && /* @__PURE__ */ jsx(
            Link,
            {
              href: `/painel/noticias?page=${news.meta.current_page + 1}`,
              className: "p-2 rounded-lg hover:bg-gray-100 text-gray-500",
              preserveState: true,
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewsIndex$1
}, Symbol.toStringTag, { value: "Module" }));
function getVal(items, key) {
  var _a;
  return ((_a = items == null ? void 0 : items.find((s) => s.key === key)) == null ? void 0 : _a.value) ?? "";
}
function Appearance({ settings }) {
  const { appearance, footer, social, esic } = settings;
  const { data, setData, post, processing } = useForm({
    color_navy: getVal(appearance, "color_navy"),
    color_gold: getVal(appearance, "color_gold"),
    color_sky: getVal(appearance, "color_sky"),
    header_title: getVal(appearance, "header_title"),
    header_subtitle: getVal(appearance, "header_subtitle"),
    footer_address: getVal(footer, "footer_address"),
    footer_phone: getVal(footer, "footer_phone"),
    footer_email: getVal(footer, "footer_email"),
    footer_hours: getVal(footer, "footer_hours"),
    social_facebook: getVal(social, "social_facebook"),
    social_instagram: getVal(social, "social_instagram"),
    social_youtube: getVal(social, "social_youtube"),
    esic_new_url: getVal(esic, "esic_new_url"),
    esic_consult_url: getVal(esic, "esic_consult_url"),
    esic_phone: getVal(esic, "esic_phone"),
    esic_email: getVal(esic, "esic_email"),
    logo_url: null,
    favicon_url: null
  });
  const logoRef = useRef(null);
  const faviconRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(getVal(appearance, "logo_url"));
  const [faviconPreview, setFaviconPreview] = useState(getVal(appearance, "favicon_url"));
  function handleFileChange(field, file) {
    setData(field, file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a, _b;
        if (field === "logo_url") setLogoPreview((_a = e.target) == null ? void 0 : _a.result);
        else setFaviconPreview((_b = e.target) == null ? void 0 : _b.result);
      };
      reader.readAsDataURL(file);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    post("/painel/aparencia", {
      forceFormData: true
    });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Aparência", children: [
    /* @__PURE__ */ jsx(Head, { title: "Aparência - Painel" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-4xl space-y-6", children: [
      /* @__PURE__ */ jsx(Section, { icon: Palette, title: "Cores do Site", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx(ColorField, { label: "Cor Principal (Navy)", value: data.color_navy, onChange: (v) => setData("color_navy", v) }),
        /* @__PURE__ */ jsx(ColorField, { label: "Cor Destaque (Gold)", value: data.color_gold, onChange: (v) => setData("color_gold", v) }),
        /* @__PURE__ */ jsx(ColorField, { label: "Cor Secundária (Sky)", value: data.color_sky, onChange: (v) => setData("color_sky", v) })
      ] }) }),
      /* @__PURE__ */ jsxs(Section, { icon: Type, title: "Identidade Visual", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(TextField, { label: "Título do Header", value: data.header_title, onChange: (v) => setData("header_title", v) }),
          /* @__PURE__ */ jsx(TextField, { label: "Subtítulo do Header", value: data.header_subtitle, onChange: (v) => setData("header_subtitle", v) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4", children: [
          /* @__PURE__ */ jsx(
            FileField,
            {
              label: "Logo (PNG)",
              preview: logoPreview,
              inputRef: logoRef,
              onChange: (f) => handleFileChange("logo_url", f)
            }
          ),
          /* @__PURE__ */ jsx(
            FileField,
            {
              label: "Favicon",
              preview: faviconPreview,
              inputRef: faviconRef,
              onChange: (f) => handleFileChange("favicon_url", f)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Section, { icon: MapPin, title: "Rodapé", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(TextField, { label: "Endereço", value: data.footer_address, onChange: (v) => setData("footer_address", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Telefone", value: data.footer_phone, onChange: (v) => setData("footer_phone", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Email", value: data.footer_email, onChange: (v) => setData("footer_email", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Horário", value: data.footer_hours, onChange: (v) => setData("footer_hours", v) })
      ] }) }),
      /* @__PURE__ */ jsx(Section, { icon: Share2, title: "Redes Sociais", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx(TextField, { label: "Facebook", value: data.social_facebook, onChange: (v) => setData("social_facebook", v), placeholder: "https://facebook.com/..." }),
        /* @__PURE__ */ jsx(TextField, { label: "Instagram", value: data.social_instagram, onChange: (v) => setData("social_instagram", v), placeholder: "https://instagram.com/..." }),
        /* @__PURE__ */ jsx(TextField, { label: "YouTube", value: data.social_youtube, onChange: (v) => setData("social_youtube", v), placeholder: "https://youtube.com/..." })
      ] }) }),
      /* @__PURE__ */ jsx(Section, { icon: Shield, title: "E-SIC", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(TextField, { label: "Link Nova Demanda", value: data.esic_new_url, onChange: (v) => setData("esic_new_url", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Link Consultar", value: data.esic_consult_url, onChange: (v) => setData("esic_consult_url", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Telefone E-SIC", value: data.esic_phone, onChange: (v) => setData("esic_phone", v) }),
        /* @__PURE__ */ jsx(TextField, { label: "Email E-SIC", value: data.esic_email, onChange: (v) => setData("esic_email", v) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-4", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          disabled: processing,
          className: "flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            processing ? "Salvando..." : "Salvar Configurações"
          ]
        }
      ) })
    ] })
  ] });
}
function Section({ icon: Icon, title, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-100 p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-navy" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold text-gray-800", children: title })
    ] }),
    children
  ] });
}
function TextField({ label, value, onChange, placeholder }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
      }
    )
  ] });
}
function ColorField({ label, value, onChange }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "color",
          value,
          onChange: (e) => onChange(e.target.value),
          className: "w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value,
          onChange: (e) => onChange(e.target.value),
          className: "flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
        }
      )
    ] })
  ] });
}
function FileField({ label, preview, inputRef, onChange }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: label }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => {
          var _a;
          return (_a = inputRef.current) == null ? void 0 : _a.click();
        },
        className: "flex items-center gap-3 px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-navy/30 transition-colors",
        children: [
          preview ? /* @__PURE__ */ jsx("img", { src: preview, alt: label, className: "w-10 h-10 object-contain rounded" }) : /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gray-100 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx(Upload, { className: "w-5 h-5 text-gray-400" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "Clique para selecionar" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: (e) => {
          var _a;
          return onChange(((_a = e.target.files) == null ? void 0 : _a[0]) || null);
        }
      }
    )
  ] });
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Appearance
}, Symbol.toStringTag, { value: "Module" }));
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing } = useForm({
    email: "",
    password: ""
  });
  function handleSubmit(e) {
    e.preventDefault();
    post("/login");
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Login - Painel Administrativo" }),
    /* @__PURE__ */ jsx(FlashMessages, {}),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center px-4", style: { background: "var(--gradient-hero)" }, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-serif font-bold text-gold", children: "C" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif font-bold text-white", children: "Painel Administrativo" }),
        /* @__PURE__ */ jsx("p", { className: "text-white/60 text-sm mt-1", children: "Câmara Municipal de Sumé" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-2xl shadow-xl p-8 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Email" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                type: "email",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                className: "w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all",
                placeholder: "admin@camaradesume.pb.gov.br",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1.5", children: "Senha" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "password",
                type: showPassword ? "text" : "password",
                value: data.password,
                onChange: (e) => setData("password", e.target.value),
                className: "w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all",
                placeholder: "••••••••",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "w-full py-3 bg-navy text-white font-medium rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            children: processing ? "Entrando..." : "Entrar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-white/40 text-xs mt-6", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Câmara Municipal de Sumé"
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
function NotFound() {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("div", { className: "title", children: "Page not found" }),
    /* @__PURE__ */ jsx("span", { children: "This page does not exist." })
  ] }) });
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound
}, Symbol.toStringTag, { value: "Module" }));
function ServerError(props) {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("div", { className: "title", children: "Server Error" }),
    /* @__PURE__ */ jsx("span", { children: props.error.message })
  ] }) });
}
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ServerError
}, Symbol.toStringTag, { value: "Module" }));
const topLinks = [
  { icon: Search, label: "Portal da Transparência", href: "#transparencia" },
  { icon: FileText, label: "E-Sic", href: "#esic" },
  { icon: MessageSquare, label: "Ouvidoria", href: "#ouvidoria" },
  { icon: HelpCircle, label: "Glossário", href: "#" },
  { icon: HelpCircle, label: "Perguntas Frequentes", href: "#" },
  { icon: Map, label: "Mapa do Site", href: "#" },
  { icon: Shield, label: "Política de Privacidade", href: "#" }
];
const TopBar = () => {
  return /* @__PURE__ */ jsx("div", { className: "bg-navy-dark text-primary-foreground py-2", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsx("nav", { className: "flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs md:text-sm", children: topLinks.map((link, index) => /* @__PURE__ */ jsxs(
    "a",
    {
      href: link.href,
      className: "flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200",
      children: [
        /* @__PURE__ */ jsx(link.icon, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsx("span", { children: link.label })
      ]
    },
    index
  )) }) }) });
};
const navItems = [
  { label: "Início", href: "#" },
  { label: "A Câmara", href: "#camara", hasDropdown: true },
  { label: "Transparência", href: "#transparencia" },
  { label: "Licitações", href: "#licitacoes" },
  { label: "Servidor", href: "#servidor", hasDropdown: true },
  { label: "Ouvidoria", href: "#ouvidoria" }
];
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return /* @__PURE__ */ jsxs("header", { className: "relative bg-gradient-hero text-primary-foreground overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative container mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-5 mb-8 animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-gold/20 blur-xl group-hover:bg-gold/30 transition-all duration-500" }),
          /* @__PURE__ */ jsx("div", { className: "relative w-20 h-20 md:w-24 md:h-24 rounded-full glass flex items-center justify-center border-2 border-primary-foreground/20 group-hover:border-gold/50 transition-all duration-500 group-hover:scale-105", children: /* @__PURE__ */ jsx("div", { className: "text-3xl md:text-4xl font-serif font-bold text-gradient-gold", children: "C" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-5xl font-serif font-bold tracking-tight", children: "CÂMARA" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl md:text-4xl font-serif text-gradient-gold", children: "DE SUMÉ" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm opacity-60 mt-2 tracking-wider uppercase", children: "Poder Legislativo Municipal" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "hidden md:block", children: /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl px-6 py-3 mx-auto max-w-3xl", children: /* @__PURE__ */ jsxs("ul", { className: "flex items-center justify-center gap-1", children: [
        navItems.map((item, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: item.href,
            className: "relative flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl hover:bg-primary-foreground/10 transition-all duration-300 group",
            children: [
              item.label,
              item.hasDropdown && /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" }),
              /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 left-4 right-4 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" })
            ]
          }
        ) }, index)),
        /* @__PURE__ */ jsx("li", { className: "ml-2", children: /* @__PURE__ */ jsx("button", { className: "p-2.5 hover:bg-primary-foreground/10 rounded-xl transition-all duration-300 group", children: /* @__PURE__ */ jsx(Search, { className: "w-5 h-5 group-hover:scale-110 transition-transform" }) }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden flex justify-center", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          className: "p-3 glass rounded-xl hover:bg-primary-foreground/10 transition-all duration-300",
          children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Menu, { className: "w-6 h-6" })
        }
      ) }),
      mobileMenuOpen && /* @__PURE__ */ jsx("nav", { className: "md:hidden mt-6 glass rounded-2xl p-4 animate-fade-in", children: /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-1", children: navItems.map((item, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: item.href,
          className: "flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-primary-foreground/10 rounded-xl transition-all duration-300",
          children: [
            item.label,
            item.hasDropdown && /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 opacity-60" })
          ]
        }
      ) }, index)) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-sky" })
  ] });
};
const placeholders = [
  "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop"
];
function formatDate$2(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
const fallbackNews = [
  { id: 1, title: "Câmara de Sumé aprova crédito de quase R$1 milhão para Educação e Infraestrutura", slug: "", excerpt: "A Câmara Municipal de Sumé realizou uma sessão extraordinária para aprovação de importantes projetos...", cover_image_url: placeholders[0], published_at: "2025-12-29T00:00:00" },
  { id: 2, title: "Câmara de Sumé Recebe Selo Ouro da ATRICON por Transparência Pública", slug: "", excerpt: "A Câmara Municipal foi agraciada com o Selo Ouro do Programa Nacional de Transparência...", cover_image_url: placeholders[1], published_at: "2025-12-22T00:00:00" },
  { id: 3, title: "Transparência e Participação Cidadã nas Sessões", slug: "", excerpt: "A Câmara mantém sua agenda de trabalho legislativo com participação ativa da população...", cover_image_url: placeholders[2], published_at: "2025-12-20T00:00:00" },
  { id: 4, title: "Participe da 2ª Audiência Pública sobre PPA e LOA", slug: "", excerpt: "Convite à população para participar da audiência pública dedicada ao planejamento municipal...", cover_image_url: placeholders[3], published_at: "2025-12-15T00:00:00" },
  { id: 5, title: "Centenário da Assembleia de Deus celebrado em sessão solene", slug: "", excerpt: "A Câmara realizou sessão solene em homenagem ao centenário da igreja na cidade...", cover_image_url: placeholders[4], published_at: "2025-11-17T00:00:00" }
];
const NewsSection = ({ news }) => {
  const items = news && news.length > 0 ? news : fallbackNews;
  const featuredNews = items[0];
  const otherNews = items.slice(1, 5);
  return /* @__PURE__ */ jsxs("section", { className: "relative py-20 px-4 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
          style: {
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')`
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-hero", style: { opacity: 0.92 } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative container mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
        featuredNews && /* @__PURE__ */ jsx("a", { href: `/noticias/${featuredNews.slug || featuredNews.id}`, className: "relative group cursor-pointer lg:row-span-2 animate-fade-in block", children: /* @__PURE__ */ jsxs("div", { className: "relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: featuredNews.cover_image_url || placeholders[0],
              alt: featuredNews.title,
              className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500", children: /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full glass flex items-center justify-center animate-pulse-glow", children: /* @__PURE__ */ jsx(Play, { className: "w-8 h-8 text-white ml-1" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-8 lg:p-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold text-sm mb-4", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: formatDate$2(featuredNews.published_at) })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-serif font-bold text-primary-foreground mb-4 group-hover:text-gold transition-colors duration-500 leading-tight", children: featuredNews.title }),
            /* @__PURE__ */ jsx("p", { className: "text-primary-foreground/80 text-base lg:text-lg line-clamp-2", children: featuredNews.excerpt })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: otherNews.map((news2, index) => /* @__PURE__ */ jsx(
          "a",
          {
            href: `/noticias/${news2.slug || news2.id}`,
            className: "relative group cursor-pointer animate-fade-in block",
            style: { animationDelay: `${index * 100}ms` },
            children: /* @__PURE__ */ jsxs("div", { className: "relative h-56 rounded-2xl overflow-hidden shadow-lg", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: news2.cover_image_url || placeholders[index + 1],
                  alt: news2.title,
                  className: "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" }),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block text-gold/80 text-xs mb-2", children: formatDate$2(news2.published_at) }),
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-serif font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug", children: news2.title })
              ] })
            ] })
          },
          news2.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/noticias",
          className: "group inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-gold hover:bg-gold hover:text-navy-dark transition-all duration-500 font-medium",
          children: [
            "Ver mais notícias",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
          ]
        }
      ) })
    ] })
  ] });
};
const quickAccessItems = [
  { icon: Play, title: "Sessões Plenárias", description: "Acompanhe as sessões ordinárias e extraordinárias", color: "from-red-500 to-rose-600" },
  { icon: Users, title: "Mesa Diretora", description: "Presidente, vice e demais membros da Mesa", color: "from-blue-500 to-indigo-600" },
  { icon: FileText, title: "Comissões", description: "Comissões técnicas e suas atribuições", color: "from-green-500 to-emerald-600" },
  { icon: BookOpen, title: "Regimento Interno", description: "Normas de funcionamento da Casa Legislativa", color: "from-amber-500 to-orange-600" },
  { icon: UserCheck, title: "Vereadores", description: "Integrantes do Poder Legislativo Municipal", color: "from-teal-500 to-cyan-600" },
  { icon: ScrollText, title: "Atas e Resumos", description: "Documentos oficiais das sessões realizadas", color: "from-purple-500 to-violet-600" },
  { icon: MessageCircle, title: "Ouvidoria", description: "Atendimento de demandas do público", color: "from-pink-500 to-rose-600" },
  { icon: Scale, title: "Leis Municipais", description: "Normas e regulamentos da cidade", color: "from-sky-500 to-blue-600" },
  { icon: Eye, title: "Transparência", description: "Portal de acesso a informações públicas", color: "from-emerald-500 to-green-600" },
  { icon: Calendar, title: "Ordem do Dia", description: "Pauta das próximas sessões parlamentares", color: "from-indigo-500 to-purple-600" }
];
const QuickAccessSection = () => {
  return /* @__PURE__ */ jsx("section", { className: "py-20 px-4 section-gradient", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14 animate-fade-in", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4", children: "Navegação Rápida" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-serif font-bold text-foreground mb-4", children: "Acesso Rápido" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5", children: quickAccessItems.map((item, index) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: "#",
        className: "group card-modern p-6 animate-fade-in",
        style: { animationDelay: `${index * 50}ms` },
        children: [
          /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`, children: /* @__PURE__ */ jsx(item.icon, { className: "w-7 h-7 text-white" }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors duration-300", children: item.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 leading-relaxed", children: item.description })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsx("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: "#transparencia",
        className: "btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4",
        children: [
          "Acessar Portal Completo",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
        ]
      }
    ) })
  ] }) });
};
const ESicSection = () => {
  return /* @__PURE__ */ jsx("section", { id: "esic", className: "py-20 px-4 bg-secondary/50 section-gradient", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14 animate-fade-in", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4", children: "Acesso à Informação" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-serif font-bold text-foreground mb-4", children: "E-SIC - Sistema Eletrônico de Informações" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Acesse informações públicas e solicite dados da administração municipal de forma transparente" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "card-modern p-8 animate-fade-in", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold text-foreground mb-8", children: "Sistema E-SIC" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-10", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "#",
              className: "btn-modern flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" }),
                "Nova Demanda",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "#",
              className: "btn-modern flex-1 flex items-center justify-center gap-3 bg-gradient-gold text-accent-foreground shadow-lg hover:shadow-xl",
              children: [
                /* @__PURE__ */ jsx(Search, { className: "w-5 h-5" }),
                "Consultar Demanda"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 border border-border/50", children: [
          /* @__PURE__ */ jsxs("h4", { className: "font-bold text-foreground mb-5 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-primary" }) }),
            "Como funciona o E-SIC?"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md", children: "1" }),
              /* @__PURE__ */ jsx("span", { className: "pt-1", children: "Cadastre sua solicitação de informação" })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md", children: "2" }),
              /* @__PURE__ */ jsx("span", { className: "pt-1", children: "Acompanhe o andamento do pedido" })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md", children: "3" }),
              /* @__PURE__ */ jsx("span", { className: "pt-1", children: "Receba a resposta em até 20 dias úteis" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl p-8 text-primary-foreground animate-fade-in", style: { animationDelay: "100ms" }, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-navy" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-sky/10" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -top-20 -right-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-20 -left-20 w-60 h-60 bg-sky/10 rounded-full blur-3xl" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold mb-8", children: "Atendimento Presencial" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-6", children: [
            { icon: MapPin, title: "Endereço", content: "Rua Luiz Grande, s/n - Centro\nCEP: 58540-000\nSumé - PB" },
            { icon: Clock, title: "Horário de Atendimento", content: "Segunda à Sexta-feira\ndas 8h às 14h" },
            { icon: Phone, title: "Telefone", content: "(83) 3353-1191" },
            { icon: Mail, title: "E-mail", content: "contato@camaradesume.pb.gov.br" }
          ].map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300", children: /* @__PURE__ */ jsx(item.icon, { className: "w-5 h-5 text-gold" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold mb-1 text-gold", children: item.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm opacity-80 whitespace-pre-line", children: item.content })
            ] })
          ] }, index)) })
        ] })
      ] })
    ] })
  ] }) });
};
const transparencyItems = [
  { icon: FileCheck, title: "Concursos e Seleções Públicas", color: "from-blue-500 to-indigo-600" },
  { icon: Gavel, title: "Apreciação e/ou Julgamento", color: "from-purple-500 to-violet-600" },
  { icon: ClipboardList, title: "Prestação de Contas da Gestão", color: "from-emerald-500 to-green-600" },
  { icon: Building2, title: "Obras", color: "from-amber-500 to-orange-600" },
  { icon: Wallet, title: "Diárias", color: "from-pink-500 to-rose-600" },
  { icon: Receipt, title: "Verbas Indenizatórias", color: "from-cyan-500 to-teal-600" },
  { icon: GraduationCap, title: "Relação de Estagiários", color: "from-red-500 to-rose-600" },
  { icon: Users2, title: "Funcionários Terceirizados", color: "from-indigo-500 to-purple-600" },
  { icon: BarChart3, title: "Relatório de Gestão", color: "from-sky-500 to-blue-600" }
];
const TransparencySection = () => {
  return /* @__PURE__ */ jsx("section", { id: "transparencia", className: "py-20 px-4 section-gradient", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14 animate-fade-in", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4", children: "Portal da Transparência" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-serif font-bold text-foreground mb-4", children: "Acesso à Informação" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Acesse todas as informações sobre carta de serviço, obras, estagiários e muito mais" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl p-8 md:p-10 mb-12 text-primary-foreground animate-fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-navy" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-sky/10" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -top-20 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-float" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row items-center gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-2xl bg-gradient-gold flex items-center justify-center shrink-0 shadow-glow animate-pulse-glow", children: /* @__PURE__ */ jsx(Award, { className: "w-12 h-12 text-navy-dark" }) }),
        /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif font-bold mb-3", children: "Radar da Transparência" }),
          /* @__PURE__ */ jsx("p", { className: "text-base opacity-80 mb-6 max-w-xl", children: "Acompanhe nossa avaliação no Radar da Transparência ATRICON. Comprometidos com a transparência e prestação de contas à população." }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "#",
              className: "btn-modern inline-flex items-center gap-3 bg-gold text-navy-dark shadow-lg hover:shadow-glow",
              children: [
                "Acessar Radar",
                /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: transparencyItems.map((item, index) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: "#",
        className: "group card-modern flex items-center gap-5 p-6 animate-fade-in",
        style: { animationDelay: `${index * 50}ms` },
        children: [
          /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`, children: /* @__PURE__ */ jsx(item.icon, { className: "w-7 h-7 text-white" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground group-hover:text-primary transition-colors duration-300", children: item.title }),
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-muted-foreground ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })
        ]
      },
      index
    )) })
  ] }) });
};
const seloTransparencia = "/assets/selo-transparencia-CbOChN1d.png";
const seloCorrupcao = "/assets/selo-prevencao-corrupcao-on2KwSX7.png";
const TransparencySealSection = () => {
  return /* @__PURE__ */ jsx("section", { className: "py-16 px-4 bg-gradient-navy text-primary-foreground", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12 animate-fade-in", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-semibold mb-4", children: "CERTIFICAÇÕES" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-4", children: "Compromisso com a Transparência" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base opacity-80 max-w-2xl mx-auto", children: "A Câmara Municipal de Sumé é reconhecida por seu compromisso com a transparência pública e combate à corrupção." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-primary-foreground/5 rounded-2xl p-6 flex flex-col items-center text-center animate-fade-in hover:bg-primary-foreground/10 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "w-36 h-36 md:w-44 md:h-44 mb-4", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: seloTransparencia,
            alt: "Selo Qualidade em Transparência Ouro 2025",
            className: "w-full h-full object-contain drop-shadow-lg"
          }
        ) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold mb-2", children: "Qualidade em Transparência" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm opacity-70 mb-4", children: "Selo Ouro concedido pelo Tribunal de Contas do Estado da Paraíba." }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "#",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-gold text-navy-dark rounded-lg text-sm font-medium hover:bg-gold-light transition-all hover:scale-[1.02] active:scale-[0.98]",
            children: [
              "Saiba Mais",
              /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-primary-foreground/5 rounded-2xl p-6 flex flex-col items-center text-center animate-fade-in hover:bg-primary-foreground/10 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "w-36 h-36 md:w-44 md:h-44 mb-4", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: seloCorrupcao,
            alt: "Selo Programa Nacional de Prevenção à Corrupção - Participante",
            className: "w-full h-full object-contain drop-shadow-lg"
          }
        ) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold mb-2", children: "Prevenção à Corrupção" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm opacity-70 mb-4", children: "Participante do Programa Nacional de Prevenção à Corrupção." }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "#",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-foreground/20 transition-all hover:scale-[1.02] active:scale-[0.98]",
            children: [
              "Conhecer Programa",
              /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-center mt-10 animate-fade-in", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: "#transparencia",
        className: "inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-medium hover:bg-gold-light transition-all hover:scale-[1.02] active:scale-[0.98]",
        children: [
          "Acessar Portal da Transparência",
          /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
        ]
      }
    ) })
  ] }) });
};
const vereadores = [
  { nome: "Vinicius Furtado Candido Palmeira Santos", apelido: "Dr. Vinicius", cargo: "Presidente", imagem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face" },
  { nome: "Maurilio de Macedo Costa", apelido: "Maurilhão", cargo: "Vice-Presidente", imagem: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face" },
  { nome: "José Everaldo Florêncio Pontes", apelido: "Everaldo Pontes", cargo: "1º Secretário", imagem: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face" },
  { nome: "Géviton Rafael da Silva Pimenta", apelido: "Rafael Pimenta", cargo: "2º Secretário", imagem: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop&crop=face" },
  { nome: "Maria das Graças Silva", apelido: "Gracinha", cargo: "Vereadora", imagem: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face" },
  { nome: "João Pedro Santos", apelido: "João Pedro", cargo: "Vereador", imagem: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face" }
];
const VereadoresSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, vereadores.length - itemsPerPage);
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };
  return /* @__PURE__ */ jsx("section", { className: "py-20 px-4 section-gradient", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14 animate-fade-in", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4", children: "Legislatura 2025-2028" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-serif font-bold text-foreground mb-4", children: "Mesa Diretora e Vereadores" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Composição da Mesa Diretora e parlamentares da Legislatura 2025-2028" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative px-8", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex transition-transform duration-700 ease-out gap-6",
          style: { transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` },
          children: vereadores.map((vereador, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] animate-fade-in",
              children: /* @__PURE__ */ jsxs("div", { className: "card-modern overflow-hidden group", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] overflow-hidden", children: [
                  /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg", children: "EM EXERCÍCIO" }),
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: vereador.imagem,
                      alt: vereador.nome,
                      className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-foreground text-sm leading-tight mb-2 line-clamp-2", children: vereador.nome.toUpperCase() }),
                  /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-3", children: vereador.apelido }),
                  /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-semibold rounded-full", children: vereador.cargo })
                ] })
              ] })
            },
            index
          ))
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handlePrev,
          disabled: currentIndex === 0,
          className: "absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleNext,
          disabled: currentIndex >= maxIndex,
          className: "absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6" })
        }
      )
    ] })
  ] }) });
};
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DiarioOficialSection = () => {
  const [mesAtual, setMesAtual] = useState(0);
  const [anoAtual, setAnoAtual] = useState(2026);
  const getDiasNoMes = (mes, ano) => {
    return new Date(ano, mes + 1, 0).getDate();
  };
  const getPrimeiroDiaSemana = (mes, ano) => {
    return new Date(ano, mes, 1).getDay();
  };
  const diasNoMes = getDiasNoMes(mesAtual, anoAtual);
  const primeiroDia = getPrimeiroDiaSemana(mesAtual, anoAtual);
  const handlePrevMes = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };
  const handleNextMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };
  return /* @__PURE__ */ jsx("section", { className: "py-16 px-4 bg-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12 animate-fade-in", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-serif font-bold text-foreground mb-4", children: "Diário Oficial" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Fique sempre atualizado com as publicações e informações oficiais do município" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-xl border border-border p-6 animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quinta, 08 de Janeiro de 2026" }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-foreground text-lg", children: "Diário Oficial do Município" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
              "Última Edição - 16/03/2023"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-lg text-foreground font-medium hover:bg-muted/80 transition-colors", children: [
          /* @__PURE__ */ jsx(Download, { className: "w-5 h-5" }),
          "Clique para baixar"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-xl border border-border overflow-hidden animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-primary p-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handlePrevMes,
              className: "w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 text-primary-foreground" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary-foreground font-bold text-lg", children: meses[mesAtual] }),
            /* @__PURE__ */ jsx("span", { className: "block text-primary-foreground/80 text-sm", children: anoAtual })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleNextMes,
              className: "w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-primary-foreground" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: diasSemana.map((dia) => /* @__PURE__ */ jsx("div", { className: "text-center text-xs font-medium text-muted-foreground py-2", children: dia }, dia)) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1", children: [
            Array.from({ length: primeiroDia }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square" }, `empty-${i}`)),
            Array.from({ length: diasNoMes }).map((_, i) => /* @__PURE__ */ jsx(
              "button",
              {
                className: "aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-primary/10 transition-colors text-foreground",
                children: i + 1
              },
              i + 1
            ))
          ] })
        ] })
      ] })
    ] })
  ] }) });
};
const posts = [
  {
    imagem: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=400&fit=crop",
    titulo: "PARABÉNS, VEREADORA MARCELA! 🎉",
    descricao: "Hoje é um dia especial...",
    likes: 17,
    comments: 6
  },
  {
    imagem: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=400&fit=crop",
    titulo: "FELIZ 2026, SUMÉ! 💚✨",
    descricao: "Vereadoras e...",
    likes: 20,
    comments: 3
  },
  {
    imagem: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop",
    titulo: "SESSÃO EXTRAORDINÁRIA! ✅",
    descricao: "Vereadores e...",
    likes: 49,
    comments: 2
  },
  {
    imagem: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=400&fit=crop",
    titulo: "DÁ PRA GANHAR O CONCURSO? ✨🎖️",
    descricao: "Brincadeira!...",
    likes: 28,
    comments: 3
  }
];
const InstagramFeedSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(posts.length - 4, prev + 1));
  };
  return /* @__PURE__ */ jsx("section", { className: "py-16 px-4 bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 mb-12 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-primary-foreground font-serif font-bold text-lg", children: "C" }) }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-foreground text-lg", children: "camaradesume" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Instagram, { className: "w-4 h-4" }),
          "205 publicações"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex gap-6 transition-transform duration-500 ease-out",
          style: { transform: `translateX(-${currentIndex * 25}%)` },
          children: posts.map((post, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] animate-fade-in",
              children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group", children: [
                /* @__PURE__ */ jsx("div", { className: "relative aspect-square overflow-hidden", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: post.imagem,
                    alt: post.titulo,
                    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-bold text-foreground text-sm mb-1 line-clamp-1", children: post.titulo }),
                  /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs mb-3 line-clamp-1", children: post.descricao }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-muted-foreground text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4" }),
                      post.likes
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }),
                      post.comments
                    ] })
                  ] })
                ] })
              ] })
            },
            index
          ))
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handlePrev,
          disabled: currentIndex === 0,
          className: "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 text-foreground" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleNext,
          disabled: currentIndex >= posts.length - 4,
          className: "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-6", children: [0, 1, 2].map((dot) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCurrentIndex(dot),
        className: `w-2 h-2 rounded-full transition-colors ${currentIndex === dot ? "bg-primary" : "bg-muted-foreground/30"}`
      },
      dot
    )) })
  ] }) });
};
const imagens = [
  { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop", alt: "Vista panorâmica de Sumé" },
  { url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop", alt: "Igreja histórica" },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop", alt: "Serra de Sumé" },
  { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop", alt: "Natureza local" },
  { url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop", alt: "Paisagem regional" }
];
const ConhecaSumeSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handlePrev = () => {
    setCurrentIndex((prev) => prev === 0 ? imagens.length - 1 : prev - 1);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => prev === imagens.length - 1 ? 0 : prev + 1);
  };
  return /* @__PURE__ */ jsx("section", { className: "py-16 px-4 bg-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "text-center mb-10 animate-fade-in", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-serif font-bold text-foreground mb-4", children: "Conheça Sumé" }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex transition-transform duration-500 ease-out",
          style: { transform: `translateX(-${currentIndex * 25}%)` },
          children: imagens.map((img, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "min-w-[25%] px-2 animate-fade-in",
              children: /* @__PURE__ */ jsx("div", { className: "aspect-[3/2] rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: img.url,
                  alt: img.alt,
                  className: "w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                }
              ) })
            },
            index
          ))
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handlePrev,
          className: "absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 border border-border shadow-lg flex items-center justify-center hover:bg-card transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6 text-foreground" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleNext,
          className: "absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 border border-border shadow-lg flex items-center justify-center hover:bg-card transition-colors",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6 text-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-6", children: imagens.map((_, index) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCurrentIndex(index),
        className: `w-2 h-2 rounded-full transition-colors ${currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"}`
      },
      index
    )) })
  ] }) });
};
const SatisfactionSurvey = () => {
  return /* @__PURE__ */ jsx("section", { className: "py-12 px-4 bg-muted/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsx("div", { className: "bg-card rounded-2xl border border-border shadow-md p-6 md:p-8 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(MessageSquareHeart, { className: "w-8 h-8 text-primary" }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left flex-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold text-foreground mb-2", children: "Pesquisa de Satisfação" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação e ajude-nos a melhorar os serviços prestados à população." }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "#",
          className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]",
          children: [
            "Participar da Pesquisa",
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
          ]
        }
      )
    ] })
  ] }) }) }) });
};
const Footer = () => {
  return /* @__PURE__ */ jsxs("footer", { className: "bg-gradient-navy text-primary-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/30", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-serif font-bold", children: "C" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-serif font-bold text-lg", children: "CÂMARA" }),
            /* @__PURE__ */ jsx("p", { className: "text-gold text-sm", children: "DE SUMÉ" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm opacity-80 mb-4", children: "Poder Legislativo Municipal - Comprometida com a transparência e o bem-estar da população sumeense." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors", children: /* @__PURE__ */ jsx(Facebook, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors", children: /* @__PURE__ */ jsx(Instagram, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors", children: /* @__PURE__ */ jsx(Youtube, { className: "w-5 h-5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-lg mb-4 text-gold", children: "Links Úteis" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Portal da Transparência" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "E-SIC" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Ouvidoria" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Licitações" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Vereadores" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Sessões Plenárias" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-lg mb-4 text-gold", children: "Institucional" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "A Câmara" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Mesa Diretora" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Comissões" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Regimento Interno" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Lei Orgânica" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "opacity-80 hover:opacity-100 hover:text-gold transition-colors", children: "Política de Privacidade" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-serif font-bold text-lg mb-4 text-gold", children: "Contato" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5 text-gold shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
              "Rua Luiz Grande, s/n - Centro",
              /* @__PURE__ */ jsx("br", {}),
              "CEP: 58540-000 - Sumé/PB"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Phone, { className: "w-5 h-5 text-gold shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "(83) 3353-1191" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-gold shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "opacity-80 break-all", children: "contato@camaradesume.pb.gov.br" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-gold shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
              "Segunda à Sexta",
              /* @__PURE__ */ jsx("br", {}),
              "8h às 14h"
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-primary-foreground/10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70", children: [
      /* @__PURE__ */ jsx("p", { children: "© 2025 Câmara Municipal de Sumé. Todos os direitos reservados." }),
      /* @__PURE__ */ jsx("p", { children: "Desenvolvido com transparência e compromisso público." })
    ] }) }) })
  ] });
};
function Home({ news }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Câmara Municipal de Sumé - Portal Oficial" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsx(TopBar, {}),
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsxs("main", { children: [
        /* @__PURE__ */ jsx(NewsSection, { news }),
        /* @__PURE__ */ jsx(QuickAccessSection, {}),
        /* @__PURE__ */ jsx(ESicSection, {}),
        /* @__PURE__ */ jsx(TransparencySection, {}),
        /* @__PURE__ */ jsx(VereadoresSection, {}),
        /* @__PURE__ */ jsx(DiarioOficialSection, {}),
        /* @__PURE__ */ jsx(InstagramFeedSection, {}),
        /* @__PURE__ */ jsx(ConhecaSumeSection, {}),
        /* @__PURE__ */ jsx(TransparencySealSection, {}),
        /* @__PURE__ */ jsx(SatisfactionSurvey, {})
      ] }),
      /* @__PURE__ */ jsx(Footer, {})
    ] })
  ] });
}
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
function PublicLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsx(TopBar, {}),
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function formatDate$1(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function NewsIndex({ news, categories, filters }) {
  const [search, setSearch] = useState(filters.search);
  function handleSearch(e) {
    e.preventDefault();
    router.get("/noticias", { busca: search, categoria: filters.category }, { preserveState: true });
  }
  function handleCategoryFilter(slug) {
    router.get("/noticias", { categoria: slug, busca: filters.search }, { preserveState: true });
  }
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Notícias - Câmara Municipal de Sumé" }),
    /* @__PURE__ */ jsx("section", { className: "relative py-16 px-4 overflow-hidden", style: { background: "var(--gradient-hero)" }, children: /* @__PURE__ */ jsxs("div", { className: "relative container mx-auto text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl lg:text-4xl font-serif font-bold text-white mb-3", children: "Notícias" }),
      /* @__PURE__ */ jsx("p", { className: "text-white/60 max-w-lg mx-auto", children: "Acompanhe as últimas notícias e atividades da Câmara Municipal de Sumé" }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSearch, className: "mt-8 max-w-lg mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Buscar notícias...",
            className: "w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/40 text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleCategoryFilter(""),
            className: `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filters.category ? "bg-gold text-navy-dark" : "bg-white/10 text-white/70 hover:bg-white/20"}`,
            children: "Todas"
          }
        ),
        categories.map((cat) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleCategoryFilter(cat.slug),
            className: `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.category === cat.slug ? "bg-gold text-navy-dark" : "bg-white/10 text-white/70 hover:bg-white/20"}`,
            children: cat.name
          },
          cat.id
        ))
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-12 px-4", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto", children: [
      news.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-lg", children: "Nenhuma notícia encontrada" }),
        (filters.search || filters.category) && /* @__PURE__ */ jsx(Link, { href: "/noticias", className: "text-navy text-sm mt-2 inline-block hover:underline", children: "Limpar filtros" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: news.data.map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/noticias/${item.slug}`,
          className: "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative h-48 overflow-hidden", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.cover_image_url || `https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&h=400&fit=crop`,
                  alt: item.title,
                  className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                }
              ),
              item.category && /* @__PURE__ */ jsx("span", { className: "absolute top-3 left-3 bg-navy/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm", children: item.category.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-400 mb-3", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: formatDate$1(item.published_at) })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "text-base font-serif font-bold text-gray-800 group-hover:text-navy transition-colors line-clamp-2 leading-snug mb-2", children: item.title }),
              item.excerpt && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 line-clamp-2", children: item.excerpt }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-navy text-sm font-medium mt-4 group-hover:gap-2 transition-all", children: [
                "Ler mais ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ] })
            ] })
          ]
        },
        item.id
      )) }),
      news.meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 mt-12", children: [
        news.meta.current_page > 1 && /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/noticias?page=${news.meta.current_page - 1}&categoria=${filters.category}&busca=${filters.search}`,
            className: "flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
              " Anterior"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400", children: [
          "Página ",
          news.meta.current_page,
          " de ",
          news.meta.last_page
        ] }),
        news.meta.current_page < news.meta.last_page && /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/noticias?page=${news.meta.current_page + 1}&categoria=${filters.category}&busca=${filters.search}`,
            className: "flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors",
            children: [
              "Próxima ",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewsIndex
}, Symbol.toStringTag, { value: "Module" }));
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function NewsShow({ news, related }) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: news.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  }
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${news.title} - Câmara Municipal de Sumé` }),
    /* @__PURE__ */ jsxs("section", { className: "relative h-64 lg:h-80 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: news.cover_image_url || `https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&h=600&fit=crop`,
          alt: news.title,
          className: "w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 p-6 lg:p-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-4xl", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/noticias", className: "inline-flex items-center gap-2 text-white/60 text-sm mb-4 hover:text-white transition-colors", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
          " Voltar para notícias"
        ] }),
        news.category && /* @__PURE__ */ jsx("span", { className: "inline-block bg-gold text-navy-dark text-xs font-medium px-3 py-1 rounded-full mb-3", children: news.category.name }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-4xl font-serif font-bold text-white leading-tight", children: news.title })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-10 px-4", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { children: formatDate(news.published_at) })
        ] }),
        news.author && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [
          /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { children: news.author.full_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [
          /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxs("span", { children: [
            news.views_count,
            " visualizações"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleShare,
            className: "ml-auto flex items-center gap-2 text-sm text-navy hover:text-navy-dark transition-colors",
            children: [
              /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }),
              "Compartilhar"
            ]
          }
        )
      ] }),
      news.excerpt && /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600 font-medium leading-relaxed mb-8", children: news.excerpt }),
      /* @__PURE__ */ jsx(
        "article",
        {
          className: "prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-navy prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl",
          dangerouslySetInnerHTML: { __html: news.content }
        }
      )
    ] }) }),
    related.length > 0 && /* @__PURE__ */ jsx("section", { className: "py-12 px-4 bg-gray-50 border-t border-gray-100", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-serif font-bold text-gray-800 mb-6", children: "Notícias Relacionadas" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5", children: related.map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/noticias/${item.slug}`,
          className: "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all",
          children: [
            /* @__PURE__ */ jsx("div", { className: "h-32 overflow-hidden", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: item.cover_image_url || "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=250&fit=crop",
                alt: item.title,
                className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: formatDate(item.published_at) }),
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-800 group-hover:text-navy line-clamp-2 mt-1 transition-colors", children: item.title })
            ] })
          ]
        },
        item.id
      )) })
    ] }) })
  ] });
}
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewsShow
}, Symbol.toStringTag, { value: "Module" }));
function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "../pages/admin/dashboard.tsx": __vite_glob_0_0, "../pages/admin/news/form.tsx": __vite_glob_0_1, "../pages/admin/news/index.tsx": __vite_glob_0_2, "../pages/admin/settings/appearance.tsx": __vite_glob_0_3, "../pages/auth/login.tsx": __vite_glob_0_4, "../pages/errors/not_found.tsx": __vite_glob_0_5, "../pages/errors/server_error.tsx": __vite_glob_0_6, "../pages/home.tsx": __vite_glob_0_7, "../pages/public/news/index.tsx": __vite_glob_0_8, "../pages/public/news/show.tsx": __vite_glob_0_9 });
      return pages[`../pages/${name}.tsx`];
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  });
}
export {
  render as default
};
