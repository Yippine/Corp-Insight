import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fullTagThemes } from '../../config/theme'
import { tools } from '../../config/tools'
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics'
import BackButton from '../common/BackButton'

export default function ToolDetail() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const { trackUrlError } = useGoogleAnalytics();
  const tool = tools.find(t => t.id === toolId)

  useEffect(() => {
    if (!tool) {
      const savedSearch = sessionStorage.getItem('toolSearchParams')
      trackUrlError(location.pathname)
      navigate(`/aitool/search${savedSearch ? `?${savedSearch}` : ''}`)
    }

    window.scrollTo(0, 0)
  }, [tool, navigate])

  if (!tool) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <BackButton
        returnPath="/aitool/search"
        sessionKey="toolSearchParams"
        buttonText="返回工具列表"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${fullTagThemes[tool.tags[0]].primary}`}>
            <tool.icon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold ml-4 text-gray-900">{tool.name}</h2>
        </div>

        <p className="text-lg text-gray-700 mb-8">{tool.description}</p>

        <div className="mb-8">
          <tool.component />
        </div>

        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => {
            const theme = fullTagThemes[tag] || fullTagThemes.ai;
            return (
              <span
                key={tag}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme.secondary} ${theme.text}`}
              >
                {theme.name}
              </span>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}