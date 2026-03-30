import { TopNavbarLayout } from '@/components/layout/TopNavbarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
  return (
    <TopNavbarLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Answers to common questions about the attendance system.</p>
        </div>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1">
                <AccordionTrigger className="text-sm">How do I mark my attendance?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Open the QR scanner from your dashboard when your teacher displays the QR code. Make sure you are within 20 meters of the classroom for automatic verification.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger className="text-sm">What if I'm outside the GPS range?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  If you are 20-50m away, your attendance will be flagged for review. Over 50m will be rejected. Contact your teacher for manual override.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger className="text-sm">How many devices can I register?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  You can register up to 5 devices. Manage them in Settings → Registered Devices.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="4">
                <AccordionTrigger className="text-sm">Why was my QR scan rejected?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  QR codes rotate every 30 seconds and are only valid during class time. Make sure to scan before the code refreshes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </TopNavbarLayout>
  );
}
