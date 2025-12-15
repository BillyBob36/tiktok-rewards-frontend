export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2024</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            When you use our TikTok Rewards platform, we collect:
          </p>
          <ul className="text-gray-300 list-disc pl-6 space-y-2">
            <li>TikTok username and user ID (via TikTok OAuth)</li>
            <li>Video URLs and performance metrics (views, likes, comments, shares)</li>
            <li>Starknet wallet address you provide</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="text-gray-300 list-disc pl-6 space-y-2">
            <li>Verify video ownership and eligibility</li>
            <li>Process and distribute cryptocurrency rewards</li>
            <li>Prevent fraud and duplicate submissions</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Data Sharing</h2>
          <p className="text-gray-300 leading-relaxed">
            We do not sell your personal data. We only share data with:
          </p>
          <ul className="text-gray-300 list-disc pl-6 space-y-2 mt-4">
            <li>TikTok API (to verify your content)</li>
            <li>Starknet blockchain (wallet addresses for payments - public by nature)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
          <p className="text-gray-300 leading-relaxed">
            We retain submission data for the duration of active campaigns and a reasonable period afterward for record-keeping purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-gray-300 leading-relaxed">
            You may request access to, correction of, or deletion of your personal data by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Contact</h2>
          <p className="text-gray-300 leading-relaxed">
            For privacy inquiries, please contact us through our platform.
          </p>
        </section>

        <a href="/" className="text-tiktok-cyan hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}
