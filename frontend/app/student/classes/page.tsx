'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Users, BookOpen, Eye, ClockAlert, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import {
  getAllApprovedClassesByStudent,
  getBannedClassByStudent,
  getAllRequestsToJoinClassByStudent,
  getStudentsByClassId,
  requestToJoinClass,
} from '@/services/student/classes'
import type { Class as BackendClass, ClassMember } from '@/lib/types'
import { getToastMessage } from '@/lib/toast/message'
import { useLanguage } from '@/components/language-provider'
import { JoinClassModal } from './_components/join-class-modal'
import { JoinRequestsModal, type JoinRequestItem } from './_components/join-requests-modal'
import { ClassMembersModal } from './_components/class-members-modal'
import { BannedClassesModal } from './_components/banned-classes-modal'
import { TOAST_COLORS } from '@/lib/toast/color'

export default function StudentClassesPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [classes, setClasses] = useState<BackendClass[]>([])

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false)
  const [isBannedClassesModalOpen, setIsBannedClassesModalOpen] = useState(false)
  const [isClassMembersModalOpen, setIsClassMembersModalOpen] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingClassMembers, setIsLoadingClassMembers] = useState(false)
  const [isLoadingBannedClasses, setIsLoadingBannedClasses] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([])
  const [bannedClasses, setBannedClasses] = useState<BackendClass[]>([])
  const [selectedClass, setSelectedClass] = useState<BackendClass | null>(null)
  const [selectedClassMembers, setSelectedClassMembers] = useState<ClassMember[]>([])

  const getTeacherLabel = (classItem: BackendClass) => {
    const profile = classItem.teacher?.profile
    const teacherName = [profile?.lastName, profile?.firstName]
      .filter(Boolean)
      .join(' ')

    return teacherName || classItem.teacher?.email
  }

  const getStudentCount = (classItem: BackendClass) => {
    return classItem.classMembers?.length ?? 0
  }

  const fetchApprovedClasses = async (token: string) => {
    setIsLoadingClasses(true)
    try {
      const result = await getAllApprovedClassesByStudent(token)
      setClasses(result.approvedClasses as BackendClass[])
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingClasses(false)
    }
  }

  const fetchPendingRequests = async (token: string) => {
    setIsLoadingRequests(true)
    try {
      const result = await getAllRequestsToJoinClassByStudent(token)
      const mappedRequests: JoinRequestItem[] = result.pendingRequests.map(
        request => ({
          id: request.id,
          classCode: request.class?.classCode ?? request.classId,
          status: request.isApproved
            ? 'approved'
            : request.isRejected
              ? 'rejected'
              : 'pending',
          requestedAt: request.joinedAt ?? new Date().toISOString(),
        })
      )

      setJoinRequests(mappedRequests)
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const fetchBannedClasses = async (token: string) => {
    setIsLoadingBannedClasses(true)
    try {
      const result = await getBannedClassByStudent(token)
      setBannedClasses(result.bannedClasses as BackendClass[])
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingBannedClasses(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    void Promise.all([
      fetchApprovedClasses(accessToken),
      fetchPendingRequests(accessToken),
      fetchBannedClasses(accessToken)
    ])
  }, [accessToken, isHydrated])

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast.error(getToastMessage('classCodeRequired', language), { className: TOAST_COLORS.error })
      return
    }

    if (!isHydrated || !accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setIsJoining(true)
    try {
      const normalizedClassCode = classCode.trim()
      const result = await requestToJoinClass(accessToken, normalizedClassCode)
      const classMember = result.class

      const requestStatus: JoinRequestItem['status'] = classMember.isApproved
        ? 'approved'
        : classMember.isRejected
          ? 'rejected'
          : 'pending'

      setJoinRequests(currentRequests => [
        {
          id: classMember.id,
          classCode: normalizedClassCode,
          status: requestStatus,
          requestedAt: classMember.joinedAt ?? new Date().toISOString(),
        },
        ...currentRequests,
      ])

      await Promise.all([
        fetchPendingRequests(accessToken),
        fetchApprovedClasses(accessToken)
      ])

      toast.success(result.message)
    } finally {
      setIsJoining(false)
      setClassCode('')
      setIsJoinModalOpen(false)
    }
  }

  const handleViewClassMembers = async (classItem: BackendClass) => {
    if (!isHydrated || !accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setSelectedClass(classItem)
    setSelectedClassMembers([])
    setIsClassMembersModalOpen(true)
    setIsLoadingClassMembers(true)

    try {
      const result = await getStudentsByClassId(accessToken, classItem.id)
      setSelectedClassMembers(result.classDetail.classMembers ?? [])
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsLoadingClassMembers(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.student.classes.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.student.classes.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t.student.classes.buttonJoinClass.buttonName}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsJoinRequestsModalOpen(true)}
          >
            <ClockAlert className="w-4 h-4" />
            {t.student.classes.buttonViewRequests.buttonName}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsBannedClassesModalOpen(true)}
          >
            <UserX className="w-4 h-4" />
            Banned Class
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.student.classes.tableViewport.columnClassName}</TableHead>
                <TableHead>{t.student.classes.tableViewport.columnTeacherName}</TableHead>
                <TableHead>{t.student.classes.tableViewport.columnStudentNumber}</TableHead>
                <TableHead>{t.student.classes.tableViewport.columnClassStatus}</TableHead>
                <TableHead>{t.student.classes.tableViewport.columnClassCode}</TableHead>
                <TableHead className="text-right">{t.student.classes.tableViewport.columnActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingClasses ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {t.common.loading}...
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">

                  </TableCell>
                </TableRow>
              ) : (
                classes.map(classItem => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.name ?? `Lớp ${classItem.classCode ?? ''}`}</TableCell>
                    <TableCell>{getTeacherLabel(classItem)}</TableCell>
                    <TableCell>{getStudentCount(classItem)}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        Đang học
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold">
                      {classItem.classCode ?? '---'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewClassMembers(classItem)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        classCode={classCode}
        onClassCodeChange={setClassCode}
        isJoining={isJoining}
        onJoin={handleJoinClass}
      />

      <JoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        onOpenChange={setIsJoinRequestsModalOpen}
        requests={joinRequests}
        isLoading={isLoadingRequests}
      />

      <ClassMembersModal
        isOpen={isClassMembersModalOpen}
        onOpenChange={setIsClassMembersModalOpen}
        className={selectedClass?.name}
        classCode={selectedClass?.classCode}
        classMembers={selectedClassMembers}
        isLoading={isLoadingClassMembers}
      />

      <BannedClassesModal
        isOpen={isBannedClassesModalOpen}
        onOpenChange={setIsBannedClassesModalOpen}
        classes={bannedClasses}
        isLoading={isLoadingBannedClasses}
      />
    </div>
  )
}
