import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { Id } from '../../convex/_generated/dataModel'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import {
  XCircle,
  Eye,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'

export const Route = createFileRoute('/admin')({
  component: AdminPanel,
})

function AdminPanel() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all')
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [tags, setTags] = useState('')

  const limit = 10

  const questionsData = useQuery(api.questions.getAllQuestions, {
    status: statusFilter,
    page: currentPage,
    limit: limit,
  })

  const stats = useQuery(api.questions.getAdminStats)

  const answerQuestion = useMutation(api.questions.answerQuestion)
  const rejectQuestion = useMutation(api.questions.rejectQuestion)
  const deleteQuestion = useMutation(api.questions.deleteQuestion)

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answer.trim()) {
      toast.error('উত্তর লিখুন')
      return
    }

    try {
      await answerQuestion({
        questionId: selectedQuestion._id,
        answer: answer.trim(),
        tags: tags
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : selectedQuestion.tags,
      })
      toast.success('প্রশ্নের উত্তর দেওয়া হয়েছে')
      setIsAnswerDialogOpen(false)
      setAnswer('')
      setTags('')
      setSelectedQuestion(null)
    } catch (error) {
      toast.error('সমস্যা হয়েছে')
      console.error(error)
    }
  }

  const handleRejectQuestion = async () => {
    if (!selectedQuestion || !rejectionReason.trim()) {
      toast.error('প্রত্যাখ্যানের কারণ লিখুন')
      return
    }

    try {
      await rejectQuestion({
        questionId: selectedQuestion._id,
        rejectionReason: rejectionReason.trim(),
      })
      toast.success('প্রশ্ন প্রত্যাখ্যাত হয়েছে')
      setIsRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedQuestion(null)
    } catch (error) {
      toast.error('সমস্যা হয়েছে')
      console.error(error)
    }
  }

  const handleDeleteQuestion = async (questionId: Id<'questions'>) => {
    if (!confirm('আপনি কি নিশ্চিত এই প্রশ্নটি মুছে ফেলতে চান?')) {
      return
    }

    try {
      await deleteQuestion({ questionId })
      toast.success('প্রশ্ন মুছে ফেলা হয়েছে')
    } catch (error) {
      toast.error('সমস্যা হয়েছে')
      console.error(error)
    }
  }

  const openAnswerDialog = (question: any) => {
    setSelectedQuestion(question)
    setAnswer(question.answer || '')
    setTags(question.tags?.join(', ') || '')
    setIsAnswerDialogOpen(true)
  }

  const openRejectDialog = (question: any) => {
    setSelectedQuestion(question)
    setRejectionReason('')
    setIsRejectDialogOpen(true)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            অপেক্ষমাণ
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            অনুমোদিত
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            প্রত্যাখ্যাত
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            অজানা
          </Badge>
        )
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!questionsData || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { questions, pagination } = questionsData

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
          <p className="text-muted-foreground">
            সকল প্রশ্নের তালিকা এবং উত্তর প্রদান
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>মোট প্রশ্ন</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>অপেক্ষমাণ</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {stats.pending}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>অনুমোদিত</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.approved}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>প্রত্যাখ্যাত</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats.rejected}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>প্রশ্নের তালিকা</CardTitle>
              <CardDescription>
                মোট {pagination.total} টি প্রশ্ন পাওয়া গেছে
              </CardDescription>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(
                  value as 'all' | 'pending' | 'approved' | 'rejected',
                )
                setCurrentPage(1)
              }}
            >
              <TabsList>
                <TabsTrigger value="all">সব</TabsTrigger>
                <TabsTrigger value="pending">অপেক্ষমাণ</TabsTrigger>
                <TabsTrigger value="approved">অনুমোদিত</TabsTrigger>
                <TabsTrigger value="rejected">প্রত্যাখ্যাত</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              কোন প্রশ্ন পাওয়া যায়নি
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>প্রশ্ন</TableHead>
                      <TableHead className="w-[120px]">ক্যাটাগরি</TableHead>
                      <TableHead className="w-[100px]">স্ট্যাটাস</TableHead>
                      <TableHead className="w-[100px]">তারিখ</TableHead>
                      <TableHead className="w-[80px] text-center">
                        <Eye className="h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        <ThumbsUp className="h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="w-[200px] text-right">
                        অ্যাকশন
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question._id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="line-clamp-2 font-medium">
                              {question.question}
                            </p>
                            {question.answer && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {question.answer}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {question.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(question.status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(question.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {question.views}
                        </TableCell>
                        <TableCell className="text-center">
                          {question.helpful}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAnswerDialog(question)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {question.answer ? 'সম্পাদনা' : 'উত্তর'}
                            </Button>
                            {question.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialog(question)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                প্রত্যাখ্যান
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteQuestion(question._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  পৃষ্ঠা {pagination.page} / {pagination.totalPages} (মোট{' '}
                  {pagination.total} টি)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    পূর্ববর্তী
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasNext}
                  >
                    পরবর্তী
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>প্রশ্নের উত্তর দিন</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.question}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="answer">উত্তর</Label>
              <Textarea
                id="answer"
                placeholder="প্রশ্নের উত্তর লিখুন..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা করুন)</Label>
              <Input
                id="tags"
                placeholder="যেমন: নামাজ, ওয়াক্ত, সময়"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAnswerDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button onClick={handleAnswerQuestion}>উত্তর জমা দিন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রশ্ন প্রত্যাখ্যান করুন</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.question}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">প্রত্যাখ্যানের কারণ</Label>
              <Textarea
                id="reason"
                placeholder="প্রত্যাখ্যানের কারণ লিখুন..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleRejectQuestion}>
              প্রত্যাখ্যান করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
