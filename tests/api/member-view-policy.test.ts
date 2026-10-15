import { describe, expect, it } from "vitest";
import { projectMember } from "@/lib/member-view-policy";

const profile = {
  id: "6f1d2c1e-0000-4000-8000-000000000001",
  email: "tendai@example.com",
  displayName: "Tendai Mensah",
  gtaArea: "Toronto",
  homeChurch: "Lakeshore Fellowship",
  showHomeChurch: true,
};

describe("projectMember", () => {
  it("never includes the email", () => {
    expect(projectMember(profile, true)).not.toHaveProperty("email");
    expect(projectMember(profile, false)).not.toHaveProperty("email");
  });

  it("keeps the church for a signed-in viewer when the member opted in", () => {
    expect(projectMember(profile, true)).toMatchObject({ homeChurch: "Lakeshore Fellowship" });
  });

  it("leaves the church out of the data for a signed-out viewer", () => {
    expect(projectMember(profile, false)).not.toHaveProperty("homeChurch");
  });

  it("leaves the church out when the member did not opt in", () => {
    expect(projectMember({ ...profile, showHomeChurch: false }, true)).not.toHaveProperty("homeChurch");
  });

  it("keeps the public profile fields", () => {
    expect(projectMember(profile, false)).toEqual({
      id: profile.id,
      displayName: "Tendai Mensah",
      gtaArea: "Toronto",
    });
  });
});
