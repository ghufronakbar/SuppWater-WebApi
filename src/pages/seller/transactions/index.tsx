import { useEffect, useState } from "react";
import SellerLayout from "@/components/layouts/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { Transaction, User } from "@prisma/client";
import formatRupiah from "@/utils/format/formatRupiah";
import formatDate from "@/utils/format/formatDate";
import { FiDollarSign } from "react-icons/fi";

interface TransactionWithUser extends Transaction {
  user: User;
}

const SellerTransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/seller/transactions");
      setTransactions(data.data);
      
      // Calculate balance
      const calculatedBalance = data.data.reduce((acc: number, transaction: TransactionWithUser) => {
        if (transaction.type === "Pemasukan") {
          return acc + transaction.amount;
        } else {
          return acc - transaction.amount;
        }
      }, 0);
      setBalance(calculatedBalance);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);

    try {
      const amount = Number(withdrawAmount);
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      if (amount > balance) {
        throw new Error("Insufficient balance");
      }

      await api.post("/seller/transactions", { amount });
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
      setShowWithdrawForm(false);
      setWithdrawAmount("");
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Pemasukan":
        return "bg-green-100 text-green-800";
      case "Pencairan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your financial transactions</p>
          </div>
          <Button onClick={() => setShowWithdrawForm(true)}>
            <FiDollarSign className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        </div>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatRupiah(balance)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (IDR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance}
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Maximum: {formatRupiah(balance)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={withdrawLoading}>
                    {withdrawLoading ? "Processing..." : "Submit Withdrawal"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowWithdrawForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <span
                          className={
                            transaction.type === "Pemasukan"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "Pemasukan" ? "+" : "-"}
                          {formatRupiah(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {transaction.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerTransactionsPage;