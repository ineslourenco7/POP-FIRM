import { useState } from "react";
import { useListMyPayments, useUploadPaymentProof, getListMyPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { UploadCloud } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const { data: payments, isLoading } = useListMyPayments();
  const uploadProof = useUploadPaymentProof();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const handleUpload = () => {
    if (!selectedPayment || !proofUrl) return;
    
    uploadProof.mutate({
      id: selectedPayment,
      data: { proofUrl }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
        setUploadOpen(false);
        setProofUrl("");
        toast({
          title: "Proof Uploaded",
          description: "Payment proof URL successfully submitted.",
        });
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">History of your challenge purchases</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{payment.challengeName}</TableCell>
                    <TableCell className="capitalize">{payment.method}</TableCell>
                    <TableCell className="text-right font-mono">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        payment.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        payment.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'pending' && !payment.proofUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment.id);
                            setUploadOpen(true);
                          }}
                        >
                          <UploadCloud className="w-4 h-4 mr-2" />
                          Upload Proof
                        </Button>
                      )}
                      {payment.proofUrl && <span className="text-xs text-muted-foreground">Proof submitted</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No payments found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Provide a link to your transaction receipt (e.g. blockchain explorer link or image URL).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Proof URL</Label>
              <Input 
                value={proofUrl} 
                onChange={(e) => setProofUrl(e.target.value)} 
                placeholder="https://..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!proofUrl || uploadProof.isPending}>
              {uploadProof.isPending ? 'Uploading...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
