import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    // accessing the current path (e.g., "/about", "/contact")
    const { pathname } = useLocation();

    useEffect(() => {
        // Whenever the path changes, instantly scroll to (0, 0) - top left
        window.scrollTo(0, 0);
    }, [pathname]);

    return null; // This component doesn't render anything visual
};

export default ScrollToTop;