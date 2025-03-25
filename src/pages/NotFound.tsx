
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

const NotFound = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl mt-4 mb-8">Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved to another URL.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
