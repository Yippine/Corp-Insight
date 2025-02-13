export default function SimpleFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div 
        className="border-gray-200 pt-8 pb-8"
      >
        <p className="text-lg text-gray-400 text-center">
          © {new Date().getFullYear()} 企業放大鏡. All rights reserved.
        </p>
      </div>
    </footer>
  );
}