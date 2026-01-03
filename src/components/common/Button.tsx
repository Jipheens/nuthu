import React from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className, disabled }) => {
    return (
        <button
            onClick={onClick}
            className={`btn ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;