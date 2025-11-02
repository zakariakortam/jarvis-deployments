const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`} />
    </div>
  )
}

export default LoadingSpinner
