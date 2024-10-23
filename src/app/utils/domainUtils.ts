export const getFaviconUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };
  
  export const getInitials = (domain: string) => {
    return domain.split('.')[0].substring(0, 2).toUpperCase();
  };