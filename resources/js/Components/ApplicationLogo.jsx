export default function ApplicationLogo({ className = 'h-9 w-auto', ...props }) {
    return (
        <img
            src="/images/logo.png"
            alt="Kredit App"
            className={className}
            {...props}
        />
    );
}
