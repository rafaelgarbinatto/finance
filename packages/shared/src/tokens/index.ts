/**
 * Design Tokens - Sistema de Design Finanças a Dois
 * Baseado nas seções 3 e 3A do documento de requisitos
 */

export const tokens = {
  // Sistema de Cores
  color: {
    // Backgrounds
    bg: {
      light: '#FFFFFF',
      dark: '#0B0B0C',
    },
    // Foreground (texto)
    fg: {
      light: '#111111',
      dark: '#EDEDEF',
    },
    // Primária (Azul - Confiança e Clareza)
    primary: '#0EA5E9',
    primaryHover: '#0284C7',
    primaryActive: '#0369A1',
    // Estados de ação
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    // Neutros
    muted: '#9CA3AF',
    mutedLight: '#E5E7EB',
    mutedDark: '#6B7280',
    // Paleta de dados (gráficos)
    dataChart: [
      '#0EA5E9', // primary
      '#60A5FA', // lighter blue
      '#34D399', // green
      '#F59E0B', // amber
      '#F87171', // red
    ],
  },
  
  // Raios de borda
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  
  // Sombras
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,.05)',
    md: '0 4px 10px rgba(0,0,0,.08)',
    lg: '0 10px 24px rgba(0,0,0,.12)',
  },
  
  // Espaçamento (8pt grid)
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  
  // Grid
  grid: {
    container: 1200,
    gutter: 16,
    column: 12,
  },
  
  // Tipografia
  fontSize: {
    display: 'clamp(32px, 4vw, 40px)',
    h1: 'clamp(24px, 3vw, 28px)',
    h2: 'clamp(20px, 2.5vw, 24px)',
    h3: '20px',
    body: '16px',
    small: '14px',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
  
  // Transições
  transition: {
    fast: '150ms',
    normal: '220ms',
    slow: '300ms',
    easeOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    easeIn: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
  },
  
  // Breakpoints
  breakpoint: {
    xs: 360,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1440,
  },
} as const;

export type Tokens = typeof tokens;
