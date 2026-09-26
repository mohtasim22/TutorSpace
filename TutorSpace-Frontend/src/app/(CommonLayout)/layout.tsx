import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/navbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-[80px]">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default CommonLayout;