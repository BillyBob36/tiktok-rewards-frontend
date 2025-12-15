export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using this TikTok Rewards platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
          <p className="text-gray-300 leading-relaxed">
            Our platform allows TikTok creators to submit their video content for potential cryptocurrency rewards (STRK tokens) based on video performance metrics. Rewards are distributed on the Starknet blockchain.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Eligibility</h2>
          <p className="text-gray-300 leading-relaxed">
            You must have a valid TikTok account and a compatible Starknet wallet to participate. You must be at least 18 years old or the age of majority in your jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. User Responsibilities</h2>
          <ul className="text-gray-300 list-disc pl-6 space-y-2">
            <li>You must own the TikTok content you submit</li>
            <li>You must provide accurate wallet addresses for rewards</li>
            <li>You may not submit the same video multiple times</li>
            <li>You must comply with TikTok Terms of Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Rewards</h2>
          <p className="text-gray-300 leading-relaxed">
            Rewards are distributed at our sole discretion based on campaign criteria. We reserve the right to modify, suspend, or cancel any campaign at any time. Blockchain transactions are final and irreversible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed">
            This service is provided as is without warranties. We are not liable for any losses related to cryptocurrency transactions, wallet errors, or blockchain network issues.
          </p>
        </section>

        <a href="/" className="text-tiktok-cyan hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}
