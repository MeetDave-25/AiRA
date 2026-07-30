"use client";

import { useState } from "react";

export default function FloatingAdminMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>Toggle Menu</button>
            {isOpen && <div>Menu is open</div>}
        </div>
    );
}
