import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                    404
                </h1>
                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <Link to="/" className="btn-primary">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
