-- CreateIndex
CREATE INDEX "Project_adminId_idx" ON "Project"("adminId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "User_status_role_idx" ON "User"("status", "role");
