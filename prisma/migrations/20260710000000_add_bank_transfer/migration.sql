-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "swiftCode" TEXT,
ADD COLUMN     "paymentReference" TEXT;

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'BANK_TRANSFER';
