const Loading = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="text-center">
                {/* Animated Food Icons */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">🍳</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                        <div className="text-4xl opacity-60">🍕</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                        <div className="text-4xl opacity-60">🍔</div>
                    </div>
                </div>

                {/* Loading Text */}
                <h2 className="text-2xl font-bold gradient-text mb-4 animate-pulse">
                    {message}
                </h2>

                {/* Loading Bar */}
                <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full animate-pulse"></div>
                </div>

                {/* Floating Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
