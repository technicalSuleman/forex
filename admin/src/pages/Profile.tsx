import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useRef, useState } from "react";

const Profile = () => {
  const adminData = {
    name: "Admin User",
    email: "admin@trazorhub.com",
    role: "Administrator",
    status: "Active",
  };

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8">
      <Card className="max-w-xl mx-auto p-6 rounded-2xl shadow-xl glass-card">
        <CardContent className="space-y-6">

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground">
            Admin Profile
          </h2>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <Button size="sm" variant="outline" onClick={handleButtonClick}>
              Change Picture
            </Button>
          </div>

          {/* Admin Info Section */}
          <div className="space-y-4 mt-6">

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">
                Full Name
              </span>
              <span className="text-sm font-medium text-foreground">
                {adminData.name}
              </span>
            </div>

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">
                Email
              </span>
              <span className="text-sm font-medium text-foreground">
                {adminData.email}
              </span>
            </div>

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-muted-foreground">
                Role
              </span>
              <span className="text-sm font-medium text-foreground">
                {adminData.role}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Status
              </span>
              <span className="text-sm font-medium text-green-500">
                {adminData.status}
              </span>
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
