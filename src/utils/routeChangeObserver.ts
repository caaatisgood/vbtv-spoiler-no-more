export function observeRouteChange(callback: (path: string) => void) {
  let currentPath = window.location.pathname;
  
  // Function to check if path changed
  const checkPath = () => {
    const newPath = window.location.pathname;
    if (newPath !== currentPath) {
      currentPath = newPath;
      callback(newPath);
    }
  }

  // Create observer instance
  const observer = new MutationObserver(() => {
    checkPath();
  });

  // Start observing document with configuration
  observer.observe(document, {
    subtree: true,
    childList: true
  });

  return () => observer.disconnect(); // Cleanup function
}
