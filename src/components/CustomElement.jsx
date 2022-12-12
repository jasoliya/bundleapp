import React from "react";

export const Button = React.forwardRef(({className, ...props}, ref) => (
    <button
        {...props}
        ref={ref}
        className={className}
    />
))

export const Menu = React.forwardRef(({className, ...props}, ref) => (
    <div
        {...props}
        ref={ref}
        className={className}
    />
));

export const Toolbar = React.forwardRef(({className, ...props}, ref) => (
    <Menu 
        {...props}
        ref={ref}
        className={className}
    />
))