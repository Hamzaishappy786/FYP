import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Mail, Phone, User, Stethoscope, Calendar, MapPin, Droplet } from "lucide-react";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const isDoctor = user?.role === "doctor";
  const profileQueryKey = isDoctor 
    ? ["/api/doctors", user?.doctorId] 
    : ["/api/patients", user?.patientId];

  const { data: profileData, isLoading } = useQuery({
    queryKey: profileQueryKey,
    enabled: !!(isDoctor ? user?.doctorId : user?.patientId),
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        ...(isDoctor
          ? {
              specialization: profileData.specialization || "",
              experience: profileData.experience || "",
              qualifications: profileData.qualifications || "",
            }
          : {
              age: profileData.age?.toString() || "",
              gender: profileData.gender || "",
              address: profileData.address || "",
              bloodGroup: profileData.bloodGroup || "",
            }),
      });
    }
  }, [profileData, isDoctor]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const endpoint = isDoctor
        ? `/api/doctors/${user?.doctorId}`
        : `/api/patients/${user?.patientId}`;
      const response = await apiRequest("PATCH", endpoint, data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Profile updated!" });
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-medical-blue-600 text-white text-2xl">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-profile-name">
                {user?.name}
              </h1>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {isDoctor ? (
                  <span className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Doctor
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Profile Information</CardTitle>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-name"
                  />
                ) : (
                  <p className="text-foreground py-2" data-testid="text-name">
                    {profileData?.name || "-"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                ) : (
                  <p className="text-foreground py-2" data-testid="text-phone">
                    {profileData?.phone || "-"}
                  </p>
                )}
              </div>

              {isDoctor ? (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Specialization
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.specialization || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Experience
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.experience || ""}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.experience || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Qualifications</Label>
                    {isEditing ? (
                      <Input
                        value={formData.qualifications || ""}
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.qualifications || "-"}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Age
                    </Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.age || ""}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.age || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Gender
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.gender || ""}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2 capitalize">
                        {profileData?.gender || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Droplet className="h-4 w-4" />
                      Blood Group
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.bloodGroup || ""}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.bloodGroup || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground py-2">
                        {profileData?.address || "-"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
